from db_config import Base
from flask import Flask, g, jsonify, render_template, request
from Database import Station, Availability, Weather, WeatherPredictive
from sqlalchemy import create_engine, func, Column, String, Integer, Double, Boolean
from sqlalchemy.orm import sessionmaker, joinedload
import pandas as pd
import numpy as np
import json
import sys
import pickle
import requests
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import train_test_split
from ml_prediction import make_prediction_for_times

app = Flask(__name__, static_url_path='')

# Get the db_info
with open('./static/dbinfo.json') as f:
    db_info = json.load(f)

USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

FORECAST_URI = 'https://api.openweathermap.org/data/2.5/forecast'

# Create a new session
engine = create_engine(
    'mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER, PASSWORD, PORT, DB), echo=True)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
session = Session()
print("connected")

# Gives all of the data needed for the home page


@app.route("/home/")
def get_all_stations():
    # Station ID, Name, longitude, latitude
    # Weather data
    # Station availability
    data = {"stations": {},
            "weather": {}}
    bike_stations = session.query(Station).all()
    bike_availability = session.query(Availability).filter(
        Availability.time_updated == func.max(Availability.time_updated).select()).all()
    weather = session.query(Weather).filter(
        Weather.time_updated == func.max(Weather.time_updated).select()).first()

    for row in bike_availability:
        data["stations"][row.station_id] = {
            "available_bikes": row.available_bikes,
            "available_bike_stands": row.available_bike_stands
        }

    for row in bike_stations:
        data["stations"][row.station_id]["name"] = row.name
        data["stations"][row.station_id]["latitude"] = row.latitude
        data["stations"][row.station_id]["longitude"] = row.longitude
    data["weather"] = {
        "type": weather.type,
        "temperature": weather.temperature,
        "humidity": weather.humidity,
        "wind speed": weather.wind_speed

    }
    row = session.query(Station).all()

    return jsonify(data)


# Joins stations tables to give static data and latest dynamic data
@app.route("/stations/")
def get_stations():
    # subquery to find latest data in availability
    latest_dynamic_data = session.query(
        func.max(Availability.time_updated)).scalar_subquery()

    station_data = session.query(Station, Availability).\
        join(Availability, Station.station_id == Availability.station_id).\
        filter(Availability.time_updated == latest_dynamic_data).all()

    data = []

    for station, availability in station_data:
        station_data = {
            'station_id': station.station_id,
            'name': station.name,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'payment_terminal': station.payment_terminal,
            'total_bike_stands': availability.bike_stands,
            'available_bikes': availability.available_bikes,
            'available_bike_stands': availability.available_bike_stands,
            'time_updated': availability.time_updated
        }
        data.append(station_data)
    return jsonify(data)


@app.route("/available/<int:station_id>")
def get_station(station_id):
    midnight = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    station_information = session.query(Availability).filter(
        Availability.time_updated > midnight, Availability.station_id == station_id).all()

    station_data_df = pd.DataFrame(
        [row.__dict__ for row in station_information])

    station_data_df = station_data_df.groupby(station_data_df['time_updated'].dt.floor('H')).agg({
        'available_bikes': 'mean',  # Example: Calculate mean temperature for each hour
        'bike_stands': 'mean'      # Example: Calculate mean humidity for each hour
    }).reset_index()
    station_data_df['hour'] = station_data_df['time_updated'].dt.hour
    station_data_df = station_data_df[[
        'hour', 'available_bikes', 'bike_stands']]

    weather_predictive = session.query(WeatherPredictive).all()
    weather_predictive_df = pd.DataFrame(
        [row.__dict__ for row in weather_predictive])
    weather_predictive_df['type'] = weather_predictive_df['weather_type']
    weather_predictive_df = weather_predictive_df[[
        'time_updated', 'temperature', 'wind_speed', 'humidity', 'type']]

    # Generate a list of hours for today
    current_date = datetime.now()
    current_hour = current_date.hour
    hours_today = [current_date.replace(
        hour=h, minute=30, second=0, microsecond=0) for h in range(current_hour, 24)]
    hourly_df = pd.DataFrame(hours_today, columns=['time_updated'])

    weather_predictive_df = pd.merge_asof(
        hourly_df, weather_predictive_df, on='time_updated', direction='nearest')

    weather_predictive_df = make_prediction_for_times(
        station_id, weather_predictive_df, station_data_df['bike_stands'][0])

    combined_df = pd.concat(
        [station_data_df[['hour', 'available_bikes']], weather_predictive_df[['hour', 'predicted_available']]])
    combined_df['available_bikes'] = combined_df['available_bikes'].apply(
        lambda x: int(x) if not pd.isna(x) else np.nan)
    combined_df['predicted_available'] = combined_df['predicted_available'].apply(
        lambda x: int(x) if not pd.isna(x) else np.nan)

    combined_df.replace(np.nan, None, inplace=True)

    data = {'data': []
            }
    for hour, avail_bikes, pred_avail in zip(combined_df['hour'].values.tolist(), combined_df['available_bikes'].values.tolist(), combined_df['predicted_available'].values.tolist()):
        data['data'].append(
            [str(hour) + ":00", avail_bikes, pred_avail])

    return jsonify(data)


@app.route('/routeplanning', methods=['POST'])
def route_planning():
    if request.method == 'POST':
        data = request.json
        # convert the time to np.datetime
        pred_time = datetime.strptime(data['time'], "%Y-%m-%d %H:%M:%S")

        if pred_time > datetime.now() + timedelta(days=5):
            return jsonify({'message': 'Invalid time. Time cannot be more than 5 days from now.'}), 400

        # Get the predicted weather for that day
        weather_predictive = session.query(WeatherPredictive).all()
        weather_predictive_df = pd.DataFrame(
            [row.__dict__ for row in weather_predictive])
        weather_predictive_df = weather_predictive_df[
            weather_predictive_df['time_updated'].dt.date == pred_time.date()]

        weather_predictive_df['type'] = weather_predictive_df['weather_type']
        weather_predictive_df = weather_predictive_df[[
            'time_updated', 'temperature', 'wind_speed', 'humidity', 'type']]

        current_hour = 0
        hours_today = [pred_time.replace(
            hour=h, minute=30, second=0, microsecond=0) for h in range(current_hour, 24)]
        hourly_df = pd.DataFrame(hours_today, columns=['time_updated'])

        weather_predictive_df = pd.merge_asof(
            hourly_df, weather_predictive_df, on='time_updated', direction='nearest')

        latest_dynamic_data = session.query(
            func.max(Availability.time_updated)).scalar_subquery()

        station_data = session.query(Availability.station_id, Availability.bike_stands).filter(
            Availability.time_updated == latest_dynamic_data, Availability.station_id.in_(data['station_ids'])).all()

        total_bike_stands = {}
        for station_id, bike_stands in station_data:
            total_bike_stands[station_id] = bike_stands

        for station_id in data['station_ids']:
            new_weather_predictive_df = make_prediction_for_times(
                station_id, weather_predictive_df.copy(), total_bike_stands[station_id])
            print(new_weather_predictive_df, file=sys.stdout)

        # For each station, send a dataframe to the ml model
        # Convert the predicted stations back into a repsonse format

    return 'YOYOYO'


@app.route('/')
def root():
    data = []
    rows = session.query(Station).all()
    for row in rows:
        data.append(row.station_id)
    # Changed to render_template as we will be importing data and I was getting errors.
    return render_template('index.html', data=data, mapsAPIKey=db_info['mapsAPIKey'])


if __name__ == "__main__":
    app.run(debug=True)
    print("Done", file=sys.stdout)
