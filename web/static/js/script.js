let map;

async function initMap() {
  let mapKey;
  let mapStyleId;
  
  try {
    const res = await fetch('/dbinfo.json')
    if (!res.ok) {
      throw new Error("Couldn't find API key or Map ID")
    }
    const data = await res.json()

    mapKey = data.mapsAPIKey
    mapStyleId = data.mapStyleID

  } catch (e) {
    console.error('Error loading dbinfo.json:', e)
  }

  //Google Maps Code
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
        ({key: mapKey, v: "weekly"});

  //Google maps own code

  // The location of Dublin
  const position = { lat: 53.344, lng: -6.2672 };
  // Request needed libraries.
  //@ts-ignore
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  // The map, centered at Dublin
  map = new Map(document.getElementById("map"), {
    zoom: 13,
    center: position,
    mapId: mapStyleId,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  
//adding inline svg
const parser = new DOMParser();
// A marker with a custom inline SVG.
const pinSvgString =
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="15" height="15" viewBox="182.39 72.82 200 254.42" xml:space="preserve"><desc>Created with Fabric.js 5.3.0</desc><defs></defs><g transform="matrix(2.8268950779 0 0 2.8268951111 282.3943661972 200.0266666667)" id="Nc5mGpUTy2nAuQOc5dw6T"><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,176,134); fill-rule: nonzero; opacity: 1;"  transform=" translate(-44.9995000237, -45)" d="M 45 0 C 25.463 0 9.625 15.838 9.625 35.375 C 9.625 44.097 12.796 52.068 18.029 58.236000000000004 L 45 90 L 71.97 58.235 C 77.203 52.068 80.374 44.096000000000004 80.374 35.373999999999995 C 80.375 15.838 64.537 0 45 0 z M 45 48.705 C 36.965 48.705 30.451999999999998 42.192 30.451999999999998 34.157 C 30.451999999999998 26.121999999999996 36.964999999999996 19.608999999999995 45 19.608999999999995 C 53.035000000000004 19.608999999999995 59.548 26.121999999999993 59.548 34.157 C 59.548 42.192 53.035 48.705 45 48.705 z" stroke-linecap="round" /></g><g transform="matrix(0.0037668369 -0.0044891414 -0.0044891414 -0.0037668369 292.9577464789 264.7808450704)" id="d_6TWENkgdCf37iEem1eV"  ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;"  transform=" translate(-6400.7296265348, -5696.4268793801)" d="M 8115 11381 C 8077 11377 7915 11326 7670 11241 C 7458 11168 7277 11104 7268 11099 C 7242 11085 7220 11036 7220 10991 C 7220 10967 7236 10910 7260 10851 C 7282 10797 7300 10743 7300 10731 C 7300 10720 7287 10696 7272 10678 C 7257 10660 7232 10626 7217 10603 C 7202 10580 7178 10553 7163 10543 C 7126 10518 7042 10523 6951 10554 C 6878 10579 6870 10580 6616 10580 C 6329 10580 6204 10589 5969 10625 C 5815 10649 5810 10649 5614 10634 C 5197 10604 5056 10579 4820 10495 C 4768 10476 4646 10436 4550 10405 C 4268 10315 4232 10297 3950 10101 C 3903 10069 3773 9982 3660 9908 C 3397 9735 3282 9643 3140 9490 C 3077 9422 2966 9305 2893 9230 C 2748 9079 2673 8974 2646 8884 C 2618 8788 2564 8622 2526 8515 C 2507 8460 2485 8380 2479 8337 C 2469 8266 2470 8250 2490 8162 C 2544 7929 2568 7878 2719 7675 C 2810 7553 2826 7537 2917 7474 C 2971 7437 3065 7373 3125 7331 C 3291 7216 3390 7112 3472 6964 C 3546 6831 3670 6653 3785 6515 C 3826 6466 3860 6422 3860 6418 C 3860 6409 3777 6195 3530 5570 C 3436 5331 3338 5081 3313 5015 C 3287 4949 3265 4893 3263 4891 C 3262 4889 3212 4901 3153 4918 C 2921 4986 2736 5011 2475 5011 C 2080 5011 1738 4932 1392 4760 C 287 4212 -248 2954 114 1759 C 307 1123 768 572 1362 269 C 1610 143 1866 63 2165 19 C 2284 1 2666 1 2785 19 C 3171 76 3508 200 3810 398 C 4066 565 4253 745 4493 1053 L 4515 1081 L 4599 1026 C 4687 967 4794 919 4881 897 C 4923 887 5019 885 5314 888 L 5692 892 L 5718 948 C 5767 1056 5742 1142 5632 1238 C 5543 1315 5410 1446 5410 1457 C 5410 1462 5461 1466 5523 1466 C 5720 1466 5855 1523 6001 1669 C 6070 1738 6095 1772 6129 1840 C 6251 2091 6235 2365 6083 2603 L 6065 2632 L 6146 2708 C 6191 2751 6822 3352 7549 4045 C 8276 4738 8874 5306 8878 5308 C 8884 5310 8990 4989 8990 4969 C 8990 4965 8935 4933 8869 4896 C 8137 4495 7658 3818 7533 3010 C 7508 2848 7508 2461 7533 2300 C 7602 1854 7784 1434 8060 1085 C 8139 985 8321 798 8420 715 C 8910 306 9508 90 10155 90 C 10591 90 10975 179 11359 371 C 12040 710 12536 1314 12718 2025 C 12870 2619 12810 3206 12541 3755 C 12412 4018 12257 4234 12050 4440 C 11635 4854 11120 5108 10515 5196 C 10347 5221 9962 5221 9795 5197 C 9644 5175 9480 5138 9359 5100 C 9308 5084 9264 5072 9263 5074 C 9254 5083 9023 5825 9028 5827 C 9032 5828 9100 5834 9180 5839 C 9330 5848 9431 5873 9585 5937 C 9638 5959 9650 5961 9690 5952 C 9826 5920 9818 5896 9667 5886 C 9543 5877 9495 5866 9453 5834 C 9392 5788 9399 5702 9465 5674 C 9507 5657 9741 5655 9840 5671 C 9958 5690 10144 5740 10209 5770 C 10250 5790 10288 5800 10319 5800 C 10402 5801 10500 5819 10549 5845 C 10615 5878 10658 5934 10720 6065 C 10748 6126 10784 6192 10801 6212 L 10830 6249 L 10809 6295 C 10774 6369 10707 6420 10558 6486 C 10472 6524 10407 6560 10375 6587 C 10265 6682 10174 6720 10058 6720 C 10008 6720 9999 6725 9983 6761 C 9977 6775 9941 6827 9904 6876 C 9866 6925 9804 7012 9765 7069 C 9675 7204 9663 7210 9510 7210 C 9447 7210 9332 7205 9255 7200 C 9118 7190 8685 7145 8624 7134 C 8597 7129 8582 7137 8505 7199 C 8426 7262 8409 7283 8319 7422 C 8162 7664 8104 7789 8075 7945 C 8068 7984 8052 8051 8041 8095 C 8025 8153 8015 8241 8004 8420 C 7987 8702 7985 8716 7934 8830 C 7884 8941 7881 9021 7923 9093 C 7938 9119 7953 9140 7955 9140 C 7958 9140 8003 9111 8055 9076 C 8166 9001 8205 8986 8268 8993 C 8328 9000 8371 9045 8394 9123 C 8416 9200 8446 9231 8548 9284 C 8596 9309 8646 9336 8660 9344 C 8674 9352 8735 9362 8795 9368 C 8913 9378 8961 9395 8981 9433 C 8999 9465 8996 9526 8972 9602 C 8947 9681 8951 9701 9008 9799 C 9054 9878 9067 9911 9073 9969 C 9082 10043 9098 10052 9248 10061 C 9326 10065 9392 10075 9415 10084 L 9452 10100 L 9445 10147 C 9416 10345 9251 10672 9076 10882 C 8939 11046 8827 11142 8713 11192 C 8687 11203 8638 11230 8603 11251 C 8396 11378 8309 11401 8115 11381 z M 6468 8711 C 6479 8704 6720 8060 6720 8037 C 6720 8033 6700 8043 6674 8060 C 6575 8129 6399 8202 6074 8309 C 5893 8368 5714 8433 5676 8452 L 5607 8487 L 5791 8494 C 6052 8503 6146 8528 6270 8620 C 6349 8678 6419 8720 6440 8720 C 6448 8720 6461 8716 6468 8711 z M 5075 7190 C 5156 7173 5254 7167 5595 7155 C 5996 7141 6074 7134 6199 7100 C 6221 7094 6240 7087 6240 7084 C 6240 7082 6191 7020 6132 6947 C 5904 6668 5788 6507 5701 6349 C 5678 6306 5653 6269 5644 6266 C 5635 6263 5595 6260 5555 6260 L 5482 6260 L 5405 6413 C 5317 6586 5193 6813 5061 7044 C 5011 7131 4970 7204 4970 7206 C 4970 7211 4962 7213 5075 7190 z M 7365 6990 C 7396 6961 7752 6792 8157 6615 C 8483 6472 8520 6453 8529 6428 C 8535 6413 8536 6400 8532 6400 C 8528 6400 8145 6382 7680 6360 C 7215 6338 6822 6320 6807 6320 L 6778 6320 L 6818 6368 C 6840 6394 6928 6490 7013 6581 L 7169 6747 L 7201 6861 C 7240 6997 7270 7037 7317 7019 C 7332 7013 7354 7000 7365 6990 z M 9300 6885 C 9494 6861 9568 6842 9647 6797 L 9719 6757 L 9647 6678 C 9570 6592 9530 6565 9496 6574 C 9458 6584 9167 6741 9030 6827 L 8895 6912 L 9040 6905 C 9120 6902 9236 6892 9300 6885 z M 4108 6040 C 4141 5938 4227 5673 4300 5450 C 4372 5227 4435 5034 4441 5021 C 4454 4989 4442 4920 4379 4680 C 4352 4578 4319 4446 4305 4385 C 4290 4325 4276 4267 4274 4257 C 4269 4242 4252 4255 4182 4322 C 4000 4496 3807 4634 3590 4745 C 3518 4781 3460 4814 3460 4819 C 3460 4827 3890 6115 3937 6247 L 3962 6319 L 4005 6273 C 4042 6231 4054 6205 4108 6040 z M 9009 6219 C 9073 6185 9152 6139 9184 6116 L 9243 6075 L 9134 6058 C 9074 6049 9010 6040 8991 6038 L 8957 6035 L 8925 6130 C 8886 6245 8877 6280 8886 6280 C 8890 6280 8945 6252 9009 6219 z M 8626 6125 C 8639 6081 8775 5651 8789 5609 C 8799 5580 9011 5784 6555 3445 C 6197 3104 5897 2819 5888 2812 C 5875 2802 5866 2803 5834 2821 C 5812 2834 5793 2845 5792 2846 C 5789 2848 5912 3306 5971 3513 L 5981 3551 L 6068 3545 C 6158 3538 6368 3551 6547 3574 C 6676 3591 6710 3612 6710 3673 C 6710 3710 6704 3720 6652 3770 C 6620 3801 6572 3839 6545 3855 C 6517 3870 6464 3903 6425 3927 C 6387 3951 6292 4003 6215 4042 C 5870 4216 5736 4319 5667 4460 C 5637 4520 5635 4533 5635 4625 C 5636 4708 5640 4739 5664 4805 C 5696 4898 5770 5040 5844 5155 C 5936 5295 6206 5648 6398 5878 L 6584 6100 L 6635 6101 C 6662 6101 7065 6116 7530 6135 C 7995 6153 8429 6167 8495 6166 L 8614 6165 L 8626 6125 z M 3569 5380 C 3470 5086 3388 4845 3386 4843 C 3378 4835 3330 4864 3333 4874 C 3436 5133 3637 5645 3682 5763 C 3716 5849 3744 5919 3746 5917 C 3748 5915 3668 5674 3569 5380 z M 4598 5538 L 4688 5421 L 4679 5377 C 4671 5331 4641 5260 4630 5260 C 4627 5260 4615 5288 4605 5323 C 4595 5357 4565 5450 4538 5529 C 4512 5609 4494 5670 4499 5664 C 4504 5659 4548 5602 4598 5538 z M 10555 5011 C 10826 4964 11032 4899 11265 4785 C 11899 4474 12356 3929 12539 3265 C 12589 3084 12611 2934 12617 2730 C 12629 2327 12561 2000 12391 1645 C 12141 1124 11685 691 11147 466 C 10574 226 9937 199 9357 392 C 8969 520 8641 727 8355 1021 C 8016 1370 7807 1777 7719 2260 C 7692 2407 7682 2753 7700 2909 C 7754 3382 7943 3814 8253 4176 C 8454 4411 8726 4627 8987 4759 L 9049 4790 L 9109 4602 C 9142 4499 9199 4321 9235 4205 C 9395 3699 9501 3366 9538 3250 L 9578 3125 L 9692 2991 C 9754 2918 9815 2845 9827 2830 L 9849 2803 L 9823 2740 C 9760 2582 9835 2407 9999 2332 C 10044 2311 10070 2306 10135 2306 C 10258 2306 10356 2359 10418 2458 C 10547 2663 10410 2930 10167 2948 L 10099 2953 L 10038 3026 C 9985 3089 9968 3119 9925 3232 C 9839 3454 9666 3901 9571 4147 C 9522 4275 9456 4459 9425 4557 C 9394 4655 9357 4769 9344 4810 C 9315 4901 9314 4906 9343 4913 C 9355 4915 9406 4929 9455 4944 C 9564 4977 9764 5017 9880 5029 C 10027 5045 10417 5035 10555 5011 z M 2670 4829 C 2870 4811 3190 4741 3190 4716 C 3190 4706 3104 4486 2830 3790 C 2736 3551 2614 3240 2558 3098 L 2458 2842 L 2416 2836 C 2354 2826 2277 2787 2230 2740 C 2132 2642 2108 2500 2169 2376 C 2260 2191 2486 2133 2663 2251 C 2711 2282 2775 2367 2786 2413 C 2790 2430 2799 2440 2811 2440 C 2821 2440 3069 2413 3362 2380 C 3655 2347 3903 2320 3913 2320 C 3922 2320 3930 2316 3930 2311 C 3930 2306 3896 2256 3854 2199 C 3756 2066 3732 2016 3715 1918 C 3707 1875 3689 1796 3675 1743 C 3616 1522 3636 1443 3767 1378 C 3825 1350 3839 1347 3997 1338 C 4206 1327 4256 1314 4321 1253 C 4348 1228 4370 1203 4370 1197 C 4370 1165 4175 934 4035 799 C 3769 544 3407 343 3047 251 C 2836 196 2738 185 2475 185 C 2212 185 2114 196 1903 251 C 1227 424 645 928 367 1581 C 230 1903 172 2218 183 2585 C 194 2949 274 3264 437 3582 C 862 4414 1758 4914 2670 4829 z M 3325 4670 C 3328 4665 2755 2937 2695 2771 C 2691 2760 2686 2760 2671 2774 C 2660 2784 2625 2802 2593 2816 C 2561 2829 2536 2843 2537 2847 C 2538 2852 2586 2974 2643 3120 C 2701 3266 2798 3511 2858 3665 C 2919 3819 3031 4105 3108 4300 C 3185 4495 3250 4665 3254 4677 C 3260 4696 3264 4697 3290 4688 C 3307 4683 3322 4674 3325 4670 z M 3530 4578 C 3768 4452 4034 4244 4182 4067 L 4223 4019 L 4197 3867 C 4168 3702 4149 3528 4125 3210 C 4096 2836 4081 2723 4044 2605 C 4017 2520 3978 2440 3964 2440 C 3946 2440 2884 2559 2838 2566 C 2811 2570 2799 2578 2794 2593 C 2791 2605 2779 2634 2768 2657 L 2747 2698 L 2993 3432 C 3127 3835 3273 4272 3316 4402 C 3407 4675 3383 4655 3530 4578 z M 5338 3730 C 5487 3706 5537 3692 5611 3654 C 5641 3639 5694 3616 5730 3604 C 5765 3591 5796 3577 5797 3573 C 5798 3569 5757 3415 5707 3231 L 5615 2898 L 5503 2894 C 5425 2892 5390 2894 5390 2902 C 5390 2908 5336 3080 5269 3284 C 5109 3776 5110 3772 5110 3781 C 5110 3785 5133 3780 5160 3769 C 5188 3759 5267 3741 5338 3730 z M 4965 3410 C 4979 3363 5029 3208 5076 3065 C 5123 2923 5159 2801 5158 2794 C 5156 2788 5131 2763 5101 2739 C 5071 2715 5025 2667 4998 2632 C 4959 2581 4950 2573 4950 2592 C 4950 2728 4898 3045 4851 3205 C 4818 3315 4817 3308 4880 3406 C 4896 3432 4912 3466 4915 3482 C 4924 3523 4933 3510 4965 3410 z M 4755 2790 C 4763 2722 4770 2614 4769 2550 L 4768 2435 L 4744 2486 C 4707 2564 4697 2632 4709 2725 C 4715 2769 4722 2831 4725 2863 C 4729 2895 4733 2920 4735 2918 C 4738 2916 4746 2858 4755 2790 z" stroke-linecap="round" /></g></svg>';

// hard coded for now but will create function to get locations from db and populat the screen

const res = await fetch('/stations/')
const data = await res.json()
    
  // The markers for each station
  const markers = data.map(({latitude: lat, longitude: lng, station_id: id}) => {
    const pinSvg = parser.parseFromString(
      pinSvgString,
      "image/svg+xml",
      ).documentElement;
      
    const pinGlyph = new google.maps.marker.PinElement({
      glyph: id.toString(),
      glyphColor: "White",
    })
    const pinBackground = new google.maps.marker.PinElement({
      background: "#FBBC04",
    });
    const pinScaled = new google.maps.marker.PinElement({
      scale: 0.5,
    })
    const marker = new AdvancedMarkerElement({
      position: {lat, lng},
      map: map,
      title: `Station Test ${id}`,
      // content: pinBackground.element,
      // content: pinScaled.element,
      // content: pinGlyph.element,
      //issue with trying to use custom SVG probably in the way its parsed
      content: pinSvg,
    });

    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
    marker.addListener("click", () => {
      infoWindow.setContent(marker.title);
      infoWindow.open(map, marker);
    });

    return marker;
  })

  // const markerCluster = new MarkerClusterer({ markers, map });
}

initMap();