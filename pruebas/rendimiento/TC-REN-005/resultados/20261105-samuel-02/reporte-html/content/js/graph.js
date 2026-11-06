/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
$(document).ready(function() {

    $(".click-title").mouseenter( function(    e){
        e.preventDefault();
        this.style.cursor="pointer";
    });
    $(".click-title").mousedown( function(event){
        event.preventDefault();
    });

    // Ugly code while this script is shared among several pages
    try{
        refreshHitsPerSecond(true);
    } catch(e){}
    try{
        refreshResponseTimeOverTime(true);
    } catch(e){}
    try{
        refreshResponseTimePercentiles();
    } catch(e){}
});


var responseTimePercentilesInfos = {
        data: {"result": {"minY": 206.0, "minX": 0.0, "maxY": 5467.0, "series": [{"data": [[0.0, 206.0], [0.1, 206.0], [0.2, 206.0], [0.3, 206.0], [0.4, 206.0], [0.5, 206.0], [0.6, 206.0], [0.7, 247.0], [0.8, 247.0], [0.9, 247.0], [1.0, 247.0], [1.1, 247.0], [1.2, 247.0], [1.3, 260.0], [1.4, 260.0], [1.5, 260.0], [1.6, 260.0], [1.7, 260.0], [1.8, 260.0], [1.9, 260.0], [2.0, 260.0], [2.1, 260.0], [2.2, 260.0], [2.3, 260.0], [2.4, 260.0], [2.5, 260.0], [2.6, 262.0], [2.7, 262.0], [2.8, 262.0], [2.9, 262.0], [3.0, 262.0], [3.1, 262.0], [3.2, 262.0], [3.3, 290.0], [3.4, 290.0], [3.5, 290.0], [3.6, 290.0], [3.7, 290.0], [3.8, 290.0], [3.9, 299.0], [4.0, 299.0], [4.1, 299.0], [4.2, 299.0], [4.3, 299.0], [4.4, 299.0], [4.5, 317.0], [4.6, 317.0], [4.7, 317.0], [4.8, 317.0], [4.9, 317.0], [5.0, 317.0], [5.1, 317.0], [5.2, 317.0], [5.3, 317.0], [5.4, 317.0], [5.5, 317.0], [5.6, 317.0], [5.7, 317.0], [5.8, 350.0], [5.9, 350.0], [6.0, 350.0], [6.1, 350.0], [6.2, 350.0], [6.3, 350.0], [6.4, 350.0], [6.5, 376.0], [6.6, 376.0], [6.7, 376.0], [6.8, 376.0], [6.9, 376.0], [7.0, 376.0], [7.1, 388.0], [7.2, 388.0], [7.3, 388.0], [7.4, 388.0], [7.5, 388.0], [7.6, 388.0], [7.7, 409.0], [7.8, 409.0], [7.9, 409.0], [8.0, 409.0], [8.1, 409.0], [8.2, 409.0], [8.3, 409.0], [8.4, 409.0], [8.5, 409.0], [8.6, 409.0], [8.7, 409.0], [8.8, 409.0], [8.9, 409.0], [9.0, 435.0], [9.1, 435.0], [9.2, 435.0], [9.3, 435.0], [9.4, 435.0], [9.5, 435.0], [9.6, 435.0], [9.7, 455.0], [9.8, 455.0], [9.9, 455.0], [10.0, 455.0], [10.1, 455.0], [10.2, 455.0], [10.3, 463.0], [10.4, 463.0], [10.5, 463.0], [10.6, 463.0], [10.7, 463.0], [10.8, 463.0], [10.9, 508.0], [11.0, 508.0], [11.1, 508.0], [11.2, 508.0], [11.3, 508.0], [11.4, 508.0], [11.5, 508.0], [11.6, 566.0], [11.7, 566.0], [11.8, 566.0], [11.9, 566.0], [12.0, 566.0], [12.1, 566.0], [12.2, 567.0], [12.3, 567.0], [12.4, 567.0], [12.5, 567.0], [12.6, 567.0], [12.7, 567.0], [12.8, 567.0], [12.9, 567.0], [13.0, 567.0], [13.1, 567.0], [13.2, 567.0], [13.3, 567.0], [13.4, 567.0], [13.5, 585.0], [13.6, 585.0], [13.7, 585.0], [13.8, 585.0], [13.9, 585.0], [14.0, 585.0], [14.1, 585.0], [14.2, 589.0], [14.3, 589.0], [14.4, 589.0], [14.5, 589.0], [14.6, 589.0], [14.7, 589.0], [14.8, 594.0], [14.9, 594.0], [15.0, 594.0], [15.1, 594.0], [15.2, 594.0], [15.3, 594.0], [15.4, 610.0], [15.5, 610.0], [15.6, 610.0], [15.7, 610.0], [15.8, 610.0], [15.9, 610.0], [16.0, 610.0], [16.1, 613.0], [16.2, 613.0], [16.3, 613.0], [16.4, 613.0], [16.5, 613.0], [16.6, 613.0], [16.7, 614.0], [16.8, 614.0], [16.9, 614.0], [17.0, 614.0], [17.1, 614.0], [17.2, 614.0], [17.3, 614.0], [17.4, 652.0], [17.5, 652.0], [17.6, 652.0], [17.7, 652.0], [17.8, 652.0], [17.9, 652.0], [18.0, 653.0], [18.1, 653.0], [18.2, 653.0], [18.3, 653.0], [18.4, 653.0], [18.5, 653.0], [18.6, 654.0], [18.7, 654.0], [18.8, 654.0], [18.9, 654.0], [19.0, 654.0], [19.1, 654.0], [19.2, 654.0], [19.3, 654.0], [19.4, 654.0], [19.5, 654.0], [19.6, 654.0], [19.7, 654.0], [19.8, 654.0], [19.9, 692.0], [20.0, 692.0], [20.1, 692.0], [20.2, 692.0], [20.3, 692.0], [20.4, 692.0], [20.5, 692.0], [20.6, 699.0], [20.7, 699.0], [20.8, 699.0], [20.9, 699.0], [21.0, 699.0], [21.1, 699.0], [21.2, 701.0], [21.3, 701.0], [21.4, 701.0], [21.5, 701.0], [21.6, 701.0], [21.7, 701.0], [21.8, 727.0], [21.9, 727.0], [22.0, 727.0], [22.1, 727.0], [22.2, 727.0], [22.3, 727.0], [22.4, 727.0], [22.5, 728.0], [22.6, 728.0], [22.7, 728.0], [22.8, 728.0], [22.9, 728.0], [23.0, 728.0], [23.1, 736.0], [23.2, 736.0], [23.3, 736.0], [23.4, 736.0], [23.5, 736.0], [23.6, 736.0], [23.7, 736.0], [23.8, 781.0], [23.9, 781.0], [24.0, 781.0], [24.1, 781.0], [24.2, 781.0], [24.3, 781.0], [24.4, 781.0], [24.5, 781.0], [24.6, 781.0], [24.7, 781.0], [24.8, 781.0], [24.9, 781.0], [25.0, 781.0], [25.1, 786.0], [25.2, 786.0], [25.3, 786.0], [25.4, 786.0], [25.5, 786.0], [25.6, 786.0], [25.7, 804.0], [25.8, 804.0], [25.9, 804.0], [26.0, 804.0], [26.1, 804.0], [26.2, 804.0], [26.3, 809.0], [26.4, 809.0], [26.5, 809.0], [26.6, 809.0], [26.7, 809.0], [26.8, 809.0], [26.9, 809.0], [27.0, 824.0], [27.1, 824.0], [27.2, 824.0], [27.3, 824.0], [27.4, 824.0], [27.5, 824.0], [27.6, 824.0], [27.7, 824.0], [27.8, 824.0], [27.9, 824.0], [28.0, 824.0], [28.1, 824.0], [28.2, 824.0], [28.3, 850.0], [28.4, 850.0], [28.5, 850.0], [28.6, 850.0], [28.7, 850.0], [28.8, 850.0], [28.9, 854.0], [29.0, 854.0], [29.1, 854.0], [29.2, 854.0], [29.3, 854.0], [29.4, 854.0], [29.5, 886.0], [29.6, 886.0], [29.7, 886.0], [29.8, 886.0], [29.9, 886.0], [30.0, 886.0], [30.1, 886.0], [30.2, 887.0], [30.3, 887.0], [30.4, 887.0], [30.5, 887.0], [30.6, 887.0], [30.7, 887.0], [30.8, 971.0], [30.9, 971.0], [31.0, 971.0], [31.1, 971.0], [31.2, 971.0], [31.3, 971.0], [31.4, 971.0], [31.5, 1052.0], [31.6, 1052.0], [31.7, 1052.0], [31.8, 1052.0], [31.9, 1052.0], [32.0, 1052.0], [32.1, 1055.0], [32.2, 1055.0], [32.3, 1055.0], [32.4, 1055.0], [32.5, 1055.0], [32.6, 1055.0], [32.7, 1056.0], [32.8, 1056.0], [32.9, 1056.0], [33.0, 1056.0], [33.1, 1056.0], [33.2, 1056.0], [33.3, 1056.0], [33.4, 1063.0], [33.5, 1063.0], [33.6, 1063.0], [33.7, 1063.0], [33.8, 1063.0], [33.9, 1063.0], [34.0, 1075.0], [34.1, 1075.0], [34.2, 1075.0], [34.3, 1075.0], [34.4, 1075.0], [34.5, 1075.0], [34.6, 1075.0], [34.7, 1083.0], [34.8, 1083.0], [34.9, 1083.0], [35.0, 1083.0], [35.1, 1083.0], [35.2, 1083.0], [35.3, 1202.0], [35.4, 1202.0], [35.5, 1202.0], [35.6, 1202.0], [35.7, 1202.0], [35.8, 1202.0], [35.9, 1229.0], [36.0, 1229.0], [36.1, 1229.0], [36.2, 1229.0], [36.3, 1229.0], [36.4, 1229.0], [36.5, 1229.0], [36.6, 1264.0], [36.7, 1264.0], [36.8, 1264.0], [36.9, 1264.0], [37.0, 1264.0], [37.1, 1264.0], [37.2, 1344.0], [37.3, 1344.0], [37.4, 1344.0], [37.5, 1344.0], [37.6, 1344.0], [37.7, 1344.0], [37.8, 1344.0], [37.9, 1435.0], [38.0, 1435.0], [38.1, 1435.0], [38.2, 1435.0], [38.3, 1435.0], [38.4, 1435.0], [38.5, 1516.0], [38.6, 1516.0], [38.7, 1516.0], [38.8, 1516.0], [38.9, 1516.0], [39.0, 1516.0], [39.1, 1516.0], [39.2, 1547.0], [39.3, 1547.0], [39.4, 1547.0], [39.5, 1547.0], [39.6, 1547.0], [39.7, 1547.0], [39.8, 1552.0], [39.9, 1552.0], [40.0, 1552.0], [40.1, 1552.0], [40.2, 1552.0], [40.3, 1552.0], [40.4, 1590.0], [40.5, 1590.0], [40.6, 1590.0], [40.7, 1590.0], [40.8, 1590.0], [40.9, 1590.0], [41.0, 1590.0], [41.1, 1602.0], [41.2, 1602.0], [41.3, 1602.0], [41.4, 1602.0], [41.5, 1602.0], [41.6, 1602.0], [41.7, 1612.0], [41.8, 1612.0], [41.9, 1612.0], [42.0, 1612.0], [42.1, 1612.0], [42.2, 1612.0], [42.3, 1612.0], [42.4, 1613.0], [42.5, 1613.0], [42.6, 1613.0], [42.7, 1613.0], [42.8, 1613.0], [42.9, 1613.0], [43.0, 1661.0], [43.1, 1661.0], [43.2, 1661.0], [43.3, 1661.0], [43.4, 1661.0], [43.5, 1661.0], [43.6, 1665.0], [43.7, 1665.0], [43.8, 1665.0], [43.9, 1665.0], [44.0, 1665.0], [44.1, 1665.0], [44.2, 1665.0], [44.3, 1716.0], [44.4, 1716.0], [44.5, 1716.0], [44.6, 1716.0], [44.7, 1716.0], [44.8, 1716.0], [44.9, 1730.0], [45.0, 1730.0], [45.1, 1730.0], [45.2, 1730.0], [45.3, 1730.0], [45.4, 1730.0], [45.5, 1730.0], [45.6, 1751.0], [45.7, 1751.0], [45.8, 1751.0], [45.9, 1751.0], [46.0, 1751.0], [46.1, 1751.0], [46.2, 1811.0], [46.3, 1811.0], [46.4, 1811.0], [46.5, 1811.0], [46.6, 1811.0], [46.7, 1811.0], [46.8, 1834.0], [46.9, 1834.0], [47.0, 1834.0], [47.1, 1834.0], [47.2, 1834.0], [47.3, 1834.0], [47.4, 1834.0], [47.5, 1883.0], [47.6, 1883.0], [47.7, 1883.0], [47.8, 1883.0], [47.9, 1883.0], [48.0, 1883.0], [48.1, 1884.0], [48.2, 1884.0], [48.3, 1884.0], [48.4, 1884.0], [48.5, 1884.0], [48.6, 1884.0], [48.7, 1884.0], [48.8, 1885.0], [48.9, 1885.0], [49.0, 1885.0], [49.1, 1885.0], [49.2, 1885.0], [49.3, 1885.0], [49.4, 1889.0], [49.5, 1889.0], [49.6, 1889.0], [49.7, 1889.0], [49.8, 1889.0], [49.9, 1889.0], [50.0, 1889.0], [50.1, 1909.0], [50.2, 1909.0], [50.3, 1909.0], [50.4, 1909.0], [50.5, 1909.0], [50.6, 1909.0], [50.7, 1913.0], [50.8, 1913.0], [50.9, 1913.0], [51.0, 1913.0], [51.1, 1913.0], [51.2, 1913.0], [51.3, 1913.0], [51.4, 1913.0], [51.5, 1913.0], [51.6, 1913.0], [51.7, 1913.0], [51.8, 1913.0], [51.9, 1913.0], [52.0, 1930.0], [52.1, 1930.0], [52.2, 1930.0], [52.3, 1930.0], [52.4, 1930.0], [52.5, 1930.0], [52.6, 1943.0], [52.7, 1943.0], [52.8, 1943.0], [52.9, 1943.0], [53.0, 1943.0], [53.1, 1943.0], [53.2, 1943.0], [53.3, 1954.0], [53.4, 1954.0], [53.5, 1954.0], [53.6, 1954.0], [53.7, 1954.0], [53.8, 1954.0], [53.9, 1970.0], [54.0, 1970.0], [54.1, 1970.0], [54.2, 1970.0], [54.3, 1970.0], [54.4, 1970.0], [54.5, 2004.0], [54.6, 2004.0], [54.7, 2004.0], [54.8, 2004.0], [54.9, 2004.0], [55.0, 2004.0], [55.1, 2004.0], [55.2, 2039.0], [55.3, 2039.0], [55.4, 2039.0], [55.5, 2039.0], [55.6, 2039.0], [55.7, 2039.0], [55.8, 2046.0], [55.9, 2046.0], [56.0, 2046.0], [56.1, 2046.0], [56.2, 2046.0], [56.3, 2046.0], [56.4, 2046.0], [56.5, 2050.0], [56.6, 2050.0], [56.7, 2050.0], [56.8, 2050.0], [56.9, 2050.0], [57.0, 2050.0], [57.1, 2052.0], [57.2, 2052.0], [57.3, 2052.0], [57.4, 2052.0], [57.5, 2052.0], [57.6, 2052.0], [57.7, 2054.0], [57.8, 2054.0], [57.9, 2054.0], [58.0, 2054.0], [58.1, 2054.0], [58.2, 2054.0], [58.3, 2054.0], [58.4, 2061.0], [58.5, 2061.0], [58.6, 2061.0], [58.7, 2061.0], [58.8, 2061.0], [58.9, 2061.0], [59.0, 2072.0], [59.1, 2072.0], [59.2, 2072.0], [59.3, 2072.0], [59.4, 2072.0], [59.5, 2072.0], [59.6, 2072.0], [59.7, 2099.0], [59.8, 2099.0], [59.9, 2099.0], [60.0, 2099.0], [60.1, 2099.0], [60.2, 2099.0], [60.3, 2108.0], [60.4, 2108.0], [60.5, 2108.0], [60.6, 2108.0], [60.7, 2108.0], [60.8, 2108.0], [60.9, 2199.0], [61.0, 2199.0], [61.1, 2199.0], [61.2, 2199.0], [61.3, 2199.0], [61.4, 2199.0], [61.5, 2199.0], [61.6, 2225.0], [61.7, 2225.0], [61.8, 2225.0], [61.9, 2225.0], [62.0, 2225.0], [62.1, 2225.0], [62.2, 2239.0], [62.3, 2239.0], [62.4, 2239.0], [62.5, 2239.0], [62.6, 2239.0], [62.7, 2239.0], [62.8, 2239.0], [62.9, 2267.0], [63.0, 2267.0], [63.1, 2267.0], [63.2, 2267.0], [63.3, 2267.0], [63.4, 2267.0], [63.5, 2268.0], [63.6, 2268.0], [63.7, 2268.0], [63.8, 2268.0], [63.9, 2268.0], [64.0, 2268.0], [64.1, 2268.0], [64.2, 2282.0], [64.3, 2282.0], [64.4, 2282.0], [64.5, 2282.0], [64.6, 2282.0], [64.7, 2282.0], [64.8, 2298.0], [64.9, 2298.0], [65.0, 2298.0], [65.1, 2298.0], [65.2, 2298.0], [65.3, 2298.0], [65.4, 2322.0], [65.5, 2322.0], [65.6, 2322.0], [65.7, 2322.0], [65.8, 2322.0], [65.9, 2322.0], [66.0, 2322.0], [66.1, 2323.0], [66.2, 2323.0], [66.3, 2323.0], [66.4, 2323.0], [66.5, 2323.0], [66.6, 2323.0], [66.7, 2378.0], [66.8, 2378.0], [66.9, 2378.0], [67.0, 2378.0], [67.1, 2378.0], [67.2, 2378.0], [67.3, 2378.0], [67.4, 2383.0], [67.5, 2383.0], [67.6, 2383.0], [67.7, 2383.0], [67.8, 2383.0], [67.9, 2383.0], [68.0, 2409.0], [68.1, 2409.0], [68.2, 2409.0], [68.3, 2409.0], [68.4, 2409.0], [68.5, 2409.0], [68.6, 2436.0], [68.7, 2436.0], [68.8, 2436.0], [68.9, 2436.0], [69.0, 2436.0], [69.1, 2436.0], [69.2, 2436.0], [69.3, 2447.0], [69.4, 2447.0], [69.5, 2447.0], [69.6, 2447.0], [69.7, 2447.0], [69.8, 2447.0], [69.9, 2469.0], [70.0, 2469.0], [70.1, 2469.0], [70.2, 2469.0], [70.3, 2469.0], [70.4, 2469.0], [70.5, 2469.0], [70.6, 2475.0], [70.7, 2475.0], [70.8, 2475.0], [70.9, 2475.0], [71.0, 2475.0], [71.1, 2475.0], [71.2, 2477.0], [71.3, 2477.0], [71.4, 2477.0], [71.5, 2477.0], [71.6, 2477.0], [71.7, 2477.0], [71.8, 2484.0], [71.9, 2484.0], [72.0, 2484.0], [72.1, 2484.0], [72.2, 2484.0], [72.3, 2484.0], [72.4, 2484.0], [72.5, 2487.0], [72.6, 2487.0], [72.7, 2487.0], [72.8, 2487.0], [72.9, 2487.0], [73.0, 2487.0], [73.1, 2503.0], [73.2, 2503.0], [73.3, 2503.0], [73.4, 2503.0], [73.5, 2503.0], [73.6, 2503.0], [73.7, 2503.0], [73.8, 2511.0], [73.9, 2511.0], [74.0, 2511.0], [74.1, 2511.0], [74.2, 2511.0], [74.3, 2511.0], [74.4, 2540.0], [74.5, 2540.0], [74.6, 2540.0], [74.7, 2540.0], [74.8, 2540.0], [74.9, 2540.0], [75.0, 2577.0], [75.1, 2577.0], [75.2, 2577.0], [75.3, 2577.0], [75.4, 2577.0], [75.5, 2577.0], [75.6, 2577.0], [75.7, 2611.0], [75.8, 2611.0], [75.9, 2611.0], [76.0, 2611.0], [76.1, 2611.0], [76.2, 2611.0], [76.3, 2612.0], [76.4, 2612.0], [76.5, 2612.0], [76.6, 2612.0], [76.7, 2612.0], [76.8, 2612.0], [76.9, 2612.0], [77.0, 2647.0], [77.1, 2647.0], [77.2, 2647.0], [77.3, 2647.0], [77.4, 2647.0], [77.5, 2647.0], [77.6, 2687.0], [77.7, 2687.0], [77.8, 2687.0], [77.9, 2687.0], [78.0, 2687.0], [78.1, 2687.0], [78.2, 2687.0], [78.3, 2704.0], [78.4, 2704.0], [78.5, 2704.0], [78.6, 2704.0], [78.7, 2704.0], [78.8, 2704.0], [78.9, 2722.0], [79.0, 2722.0], [79.1, 2722.0], [79.2, 2722.0], [79.3, 2722.0], [79.4, 2722.0], [79.5, 2735.0], [79.6, 2735.0], [79.7, 2735.0], [79.8, 2735.0], [79.9, 2735.0], [80.0, 2735.0], [80.1, 2735.0], [80.2, 2738.0], [80.3, 2738.0], [80.4, 2738.0], [80.5, 2738.0], [80.6, 2738.0], [80.7, 2738.0], [80.8, 2769.0], [80.9, 2769.0], [81.0, 2769.0], [81.1, 2769.0], [81.2, 2769.0], [81.3, 2769.0], [81.4, 2769.0], [81.5, 2827.0], [81.6, 2827.0], [81.7, 2827.0], [81.8, 2827.0], [81.9, 2827.0], [82.0, 2827.0], [82.1, 2837.0], [82.2, 2837.0], [82.3, 2837.0], [82.4, 2837.0], [82.5, 2837.0], [82.6, 2837.0], [82.7, 2873.0], [82.8, 2873.0], [82.9, 2873.0], [83.0, 2873.0], [83.1, 2873.0], [83.2, 2873.0], [83.3, 2873.0], [83.4, 2894.0], [83.5, 2894.0], [83.6, 2894.0], [83.7, 2894.0], [83.8, 2894.0], [83.9, 2894.0], [84.0, 2901.0], [84.1, 2901.0], [84.2, 2901.0], [84.3, 2901.0], [84.4, 2901.0], [84.5, 2901.0], [84.6, 2901.0], [84.7, 2902.0], [84.8, 2902.0], [84.9, 2902.0], [85.0, 2902.0], [85.1, 2902.0], [85.2, 2902.0], [85.3, 2909.0], [85.4, 2909.0], [85.5, 2909.0], [85.6, 2909.0], [85.7, 2909.0], [85.8, 2909.0], [85.9, 2976.0], [86.0, 2976.0], [86.1, 2976.0], [86.2, 2976.0], [86.3, 2976.0], [86.4, 2976.0], [86.5, 2976.0], [86.6, 2996.0], [86.7, 2996.0], [86.8, 2996.0], [86.9, 2996.0], [87.0, 2996.0], [87.1, 2996.0], [87.2, 3042.0], [87.3, 3042.0], [87.4, 3042.0], [87.5, 3042.0], [87.6, 3042.0], [87.7, 3042.0], [87.8, 3042.0], [87.9, 3189.0], [88.0, 3189.0], [88.1, 3189.0], [88.2, 3189.0], [88.3, 3189.0], [88.4, 3189.0], [88.5, 3251.0], [88.6, 3251.0], [88.7, 3251.0], [88.8, 3251.0], [88.9, 3251.0], [89.0, 3251.0], [89.1, 3251.0], [89.2, 3260.0], [89.3, 3260.0], [89.4, 3260.0], [89.5, 3260.0], [89.6, 3260.0], [89.7, 3260.0], [89.8, 3317.0], [89.9, 3317.0], [90.0, 3317.0], [90.1, 3317.0], [90.2, 3317.0], [90.3, 3317.0], [90.4, 3318.0], [90.5, 3318.0], [90.6, 3318.0], [90.7, 3318.0], [90.8, 3318.0], [90.9, 3318.0], [91.0, 3318.0], [91.1, 3365.0], [91.2, 3365.0], [91.3, 3365.0], [91.4, 3365.0], [91.5, 3365.0], [91.6, 3365.0], [91.7, 3368.0], [91.8, 3368.0], [91.9, 3368.0], [92.0, 3368.0], [92.1, 3368.0], [92.2, 3368.0], [92.3, 3368.0], [92.4, 3370.0], [92.5, 3370.0], [92.6, 3370.0], [92.7, 3370.0], [92.8, 3370.0], [92.9, 3370.0], [93.0, 3416.0], [93.1, 3416.0], [93.2, 3416.0], [93.3, 3416.0], [93.4, 3416.0], [93.5, 3416.0], [93.6, 3505.0], [93.7, 3505.0], [93.8, 3505.0], [93.9, 3505.0], [94.0, 3505.0], [94.1, 3505.0], [94.2, 3505.0], [94.3, 3597.0], [94.4, 3597.0], [94.5, 3597.0], [94.6, 3597.0], [94.7, 3597.0], [94.8, 3597.0], [94.9, 3865.0], [95.0, 3865.0], [95.1, 3865.0], [95.2, 3865.0], [95.3, 3865.0], [95.4, 3865.0], [95.5, 3865.0], [95.6, 4193.0], [95.7, 4193.0], [95.8, 4193.0], [95.9, 4193.0], [96.0, 4193.0], [96.1, 4193.0], [96.2, 4297.0], [96.3, 4297.0], [96.4, 4297.0], [96.5, 4297.0], [96.6, 4297.0], [96.7, 4297.0], [96.8, 4582.0], [96.9, 4582.0], [97.0, 4582.0], [97.1, 4582.0], [97.2, 4582.0], [97.3, 4582.0], [97.4, 4582.0], [97.5, 4636.0], [97.6, 4636.0], [97.7, 4636.0], [97.8, 4636.0], [97.9, 4636.0], [98.0, 4636.0], [98.1, 4637.0], [98.2, 4637.0], [98.3, 4637.0], [98.4, 4637.0], [98.5, 4637.0], [98.6, 4637.0], [98.7, 4637.0], [98.8, 4684.0], [98.9, 4684.0], [99.0, 4684.0], [99.1, 4684.0], [99.2, 4684.0], [99.3, 4684.0], [99.4, 5467.0], [99.5, 5467.0], [99.6, 5467.0], [99.7, 5467.0], [99.8, 5467.0], [99.9, 5467.0]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
        getOptions: function() {
            return {
                series: {
                    points: { show: false }
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentiles'
                },
                xaxis: {
                    tickDecimals: 1,
                    axisLabel: "Percentiles",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Percentile value in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : %x.2 percentile was %y ms"
                },
                selection: { mode: "xy" },
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentiles"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesPercentiles"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesPercentiles"), dataset, prepareOverviewOptions(options));
        }
};

/**
 * @param elementId Id of element where we display message
 */
function setEmptyGraph(elementId) {
    $(function() {
        $(elementId).text("No graph series with filter="+seriesFilter);
    });
}

// Response times percentiles
function refreshResponseTimePercentiles() {
    var infos = responseTimePercentilesInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimePercentiles");
        return;
    }
    if (isGraph($("#flotResponseTimesPercentiles"))){
        infos.createGraph();
    } else {
        var choiceContainer = $("#choicesResponseTimePercentiles");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesPercentiles", "#overviewResponseTimesPercentiles");
        $('#bodyResponseTimePercentiles .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimeDistributionInfos = {
        data: {"result": {"minY": 1.0, "minX": 200.0, "maxY": 9.0, "series": [{"data": [[600.0, 9.0], [700.0, 7.0], [800.0, 8.0], [900.0, 1.0], [1000.0, 6.0], [1200.0, 3.0], [1300.0, 1.0], [1400.0, 1.0], [1500.0, 4.0], [1600.0, 5.0], [1700.0, 3.0], [1800.0, 6.0], [1900.0, 7.0], [2000.0, 9.0], [2100.0, 2.0], [2200.0, 6.0], [2300.0, 4.0], [2400.0, 8.0], [2500.0, 4.0], [2600.0, 4.0], [2700.0, 5.0], [2800.0, 4.0], [2900.0, 5.0], [3000.0, 1.0], [3100.0, 1.0], [3300.0, 5.0], [3200.0, 2.0], [200.0, 7.0], [3400.0, 1.0], [3500.0, 2.0], [3800.0, 1.0], [4100.0, 1.0], [4200.0, 1.0], [4600.0, 3.0], [4500.0, 1.0], [300.0, 5.0], [5400.0, 1.0], [400.0, 5.0], [500.0, 7.0]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 5400.0, "title": "Response Time Distribution"}},
        getOptions: function() {
            var granularity = this.data.result.granularity;
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    barWidth: this.data.result.granularity
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " responses for " + label + " were between " + xval + " and " + (xval + granularity) + " ms";
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimeDistribution"), prepareData(data.result.series, $("#choicesResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshResponseTimeDistribution() {
    var infos = responseTimeDistributionInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeDistribution");
        return;
    }
    if (isGraph($("#flotResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var syntheticResponseTimeDistributionInfos = {
        data: {"result": {"minY": 17.0, "minX": 0.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 96.0, "series": [{"data": [[0.0, 17.0]], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [[1.0, 43.0]], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 96.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 2.0, "title": "Synthetic Response Times Distribution"}},
        getOptions: function() {
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendSyntheticResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times ranges",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                    tickLength:0,
                    min:-0.5,
                    max:3.5
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    align: "center",
                    barWidth: 0.25,
                    fill:.75
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " " + label;
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            options.xaxis.ticks = data.result.ticks;
            $.plot($("#flotSyntheticResponseTimeDistribution"), prepareData(data.result.series, $("#choicesSyntheticResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshSyntheticResponseTimeDistribution() {
    var infos = syntheticResponseTimeDistributionInfos;
    prepareSeries(infos.data, true);
    if (isGraph($("#flotSyntheticResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerSyntheticResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var activeThreadsOverTimeInfos = {
        data: {"result": {"minY": 4.944954128440368, "minX": 1.79390496E12, "maxY": 5.0, "series": [{"data": [[1.79390496E12, 4.944954128440368], [1.79390502E12, 5.0]], "isOverall": false, "label": "5 usuario(s) virtual(es)", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79390502E12, "title": "Active Threads Over Time"}},
        getOptions: function() {
            return {
                series: {
                    stack: true,
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 6,
                    show: true,
                    container: '#legendActiveThreadsOverTime'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                selection: {
                    mode: 'xy'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : At %x there were %y active threads"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesActiveThreadsOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotActiveThreadsOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewActiveThreadsOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Active Threads Over Time
function refreshActiveThreadsOverTime(fixTimestamps) {
    var infos = activeThreadsOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotActiveThreadsOverTime"))) {
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesActiveThreadsOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotActiveThreadsOverTime", "#overviewActiveThreadsOverTime");
        $('#footerActiveThreadsOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var timeVsThreadsInfos = {
        data: {"result": {"minY": 1435.0, "minX": 2.0, "maxY": 1954.0, "series": [{"data": [[2.0, 1751.0], [4.0, 1954.0], [5.0, 1848.2549019607848], [3.0, 1435.0]], "isOverall": false, "label": "Consulta P1", "isController": false}, {"data": [[4.961538461538463, 1845.6602564102566]], "isOverall": false, "label": "Consulta P1-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 5.0, "title": "Time VS Threads"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: { noColumns: 2,show: true, container: '#legendTimeVsThreads' },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: At %x.2 active threads, Average response time was %y.2 ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesTimeVsThreads"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotTimesVsThreads"), dataset, options);
            // setup overview
            $.plot($("#overviewTimesVsThreads"), dataset, prepareOverviewOptions(options));
        }
};

// Time vs threads
function refreshTimeVsThreads(){
    var infos = timeVsThreadsInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTimeVsThreads");
        return;
    }
    if(isGraph($("#flotTimesVsThreads"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTimeVsThreads");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTimesVsThreads", "#overviewTimesVsThreads");
        $('#footerTimeVsThreads .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var bytesThroughputOverTimeInfos = {
        data : {"result": {"minY": 208.36666666666667, "minX": 1.79390496E12, "maxY": 528407.6166666667, "series": [{"data": [[1.79390496E12, 528407.6166666667], [1.79390502E12, 227845.13333333333]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.79390496E12, 483.23333333333335], [1.79390502E12, 208.36666666666667]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79390502E12, "title": "Bytes Throughput Over Time"}},
        getOptions : function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity) ,
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Bytes / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendBytesThroughputOverTime'
                },
                selection: {
                    mode: "xy"
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y"
                }
            };
        },
        createGraph : function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesBytesThroughputOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotBytesThroughputOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewBytesThroughputOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Bytes throughput Over Time
function refreshBytesThroughputOverTime(fixTimestamps) {
    var infos = bytesThroughputOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotBytesThroughputOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesBytesThroughputOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotBytesThroughputOverTime", "#overviewBytesThroughputOverTime");
        $('#footerBytesThroughputOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimesOverTimeInfos = {
        data: {"result": {"minY": 1425.829787234043, "minX": 1.79390496E12, "maxY": 2026.6880733944956, "series": [{"data": [[1.79390496E12, 2026.6880733944956], [1.79390502E12, 1425.829787234043]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79390502E12, "title": "Response Time Over Time"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average response time was %y ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Times Over Time
function refreshResponseTimeOverTime(fixTimestamps) {
    var infos = responseTimesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotResponseTimesOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesOverTime", "#overviewResponseTimesOverTime");
        $('#footerResponseTimesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var latenciesOverTimeInfos = {
        data: {"result": {"minY": 950.2340425531913, "minX": 1.79390496E12, "maxY": 1387.2293577981638, "series": [{"data": [[1.79390496E12, 1387.2293577981638], [1.79390502E12, 950.2340425531913]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79390502E12, "title": "Latencies Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response latencies in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendLatenciesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average latency was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesLatenciesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotLatenciesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewLatenciesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Latencies Over Time
function refreshLatenciesOverTime(fixTimestamps) {
    var infos = latenciesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyLatenciesOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotLatenciesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesLatenciesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotLatenciesOverTime", "#overviewLatenciesOverTime");
        $('#footerLatenciesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var connectTimeOverTimeInfos = {
        data: {"result": {"minY": 5.807339449541284, "minX": 1.79390496E12, "maxY": 6.999999999999999, "series": [{"data": [[1.79390496E12, 5.807339449541284], [1.79390502E12, 6.999999999999999]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79390502E12, "title": "Connect Time Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getConnectTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average Connect Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendConnectTimeOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average connect time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesConnectTimeOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotConnectTimeOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewConnectTimeOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Connect Time Over Time
function refreshConnectTimeOverTime(fixTimestamps) {
    var infos = connectTimeOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyConnectTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotConnectTimeOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesConnectTimeOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotConnectTimeOverTime", "#overviewConnectTimeOverTime");
        $('#footerConnectTimeOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var responseTimePercentilesOverTimeInfos = {
        data: {"result": {"minY": 206.0, "minX": 1.79390496E12, "maxY": 5467.0, "series": [{"data": [[1.79390496E12, 4636.0], [1.79390502E12, 5467.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.79390496E12, 260.0], [1.79390502E12, 206.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.79390496E12, 3317.0], [1.79390502E12, 4354.000000000001]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.79390496E12, 4591.700000000003], [1.79390502E12, 5467.0]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.79390496E12, 2061.0], [1.79390502E12, 824.0]], "isOverall": false, "label": "Median", "isController": false}, {"data": [[1.79390496E12, 3460.5], [1.79390502E12, 4665.2]], "isOverall": false, "label": "95th percentile", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79390502E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Response Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentilesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Response time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentilesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimePercentilesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimePercentilesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Time Percentiles Over Time
function refreshResponseTimePercentilesOverTime(fixTimestamps) {
    var infos = responseTimePercentilesOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotResponseTimePercentilesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimePercentilesOverTime", "#overviewResponseTimePercentilesOverTime");
        $('#footerResponseTimePercentilesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var responseTimeVsRequestInfos = {
    data: {"result": {"minY": 455.0, "minX": 1.0, "maxY": 2722.0, "series": [{"data": [[1.0, 2722.0], [2.0, 2493.0], [4.0, 2295.0], [9.0, 455.0], [5.0, 1775.0], [10.0, 524.0], [3.0, 2199.0], [6.0, 714.0], [7.0, 2039.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 10.0, "title": "Response Time Vs Request"}},
    getOptions: function() {
        return {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Response Time in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: {
                noColumns: 2,
                show: true,
                container: '#legendResponseTimeVsRequest'
            },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median response time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesResponseTimeVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotResponseTimeVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewResponseTimeVsRequest"), dataset, prepareOverviewOptions(options));

    }
};

// Response Time vs Request
function refreshResponseTimeVsRequest() {
    var infos = responseTimeVsRequestInfos;
    prepareSeries(infos.data);
    if (isGraph($("#flotResponseTimeVsRequest"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeVsRequest");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimeVsRequest", "#overviewResponseTimeVsRequest");
        $('#footerResponseRimeVsRequest .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var latenciesVsRequestInfos = {
    data: {"result": {"minY": 195.0, "minX": 1.0, "maxY": 1798.0, "series": [{"data": [[1.0, 1798.0], [2.0, 1593.0], [4.0, 1538.5], [9.0, 195.0], [5.0, 1192.5], [10.0, 416.0], [3.0, 1683.0], [6.0, 534.5], [7.0, 360.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 10.0, "title": "Latencies Vs Request"}},
    getOptions: function() {
        return{
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Latency in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: { noColumns: 2,show: true, container: '#legendLatencyVsRequest' },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median Latency time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesLatencyVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotLatenciesVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewLatenciesVsRequest"), dataset, prepareOverviewOptions(options));
    }
};

// Latencies vs Request
function refreshLatenciesVsRequest() {
        var infos = latenciesVsRequestInfos;
        prepareSeries(infos.data);
        if(isGraph($("#flotLatenciesVsRequest"))){
            infos.createGraph();
        }else{
            var choiceContainer = $("#choicesLatencyVsRequest");
            createLegend(choiceContainer, infos);
            infos.createGraph();
            setGraphZoomable("#flotLatenciesVsRequest", "#overviewLatenciesVsRequest");
            $('#footerLatenciesVsRequest .legendColorBox > div').each(function(i){
                $(this).clone().prependTo(choiceContainer.find("li").eq(i));
            });
        }
};

var hitsPerSecondInfos = {
        data: {"result": {"minY": 0.7, "minX": 1.79390496E12, "maxY": 1.9, "series": [{"data": [[1.79390496E12, 1.9], [1.79390502E12, 0.7]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79390502E12, "title": "Hits Per Second"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of hits / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendHitsPerSecond"
                },
                selection: {
                    mode : 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y.2 hits/sec"
                }
            };
        },
        createGraph: function createGraph() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesHitsPerSecond"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotHitsPerSecond"), dataset, options);
            // setup overview
            $.plot($("#overviewHitsPerSecond"), dataset, prepareOverviewOptions(options));
        }
};

// Hits per second
function refreshHitsPerSecond(fixTimestamps) {
    var infos = hitsPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if (isGraph($("#flotHitsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesHitsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotHitsPerSecond", "#overviewHitsPerSecond");
        $('#footerHitsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var codesPerSecondInfos = {
        data: {"result": {"minY": 0.7833333333333333, "minX": 1.79390496E12, "maxY": 1.8166666666666667, "series": [{"data": [[1.79390496E12, 1.8166666666666667], [1.79390502E12, 0.7833333333333333]], "isOverall": false, "label": "202", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79390502E12, "title": "Codes Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendCodesPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "Number of Response Codes %s at %x was %y.2 responses / sec"
                }
            };
        },
    createGraph: function() {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesCodesPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotCodesPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewCodesPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Codes per second
function refreshCodesPerSecond(fixTimestamps) {
    var infos = codesPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotCodesPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesCodesPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotCodesPerSecond", "#overviewCodesPerSecond");
        $('#footerCodesPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var transactionsPerSecondInfos = {
        data: {"result": {"minY": 0.7833333333333333, "minX": 1.79390496E12, "maxY": 1.8166666666666667, "series": [{"data": [[1.79390496E12, 1.8166666666666667], [1.79390502E12, 0.7833333333333333]], "isOverall": false, "label": "Consulta P1-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79390502E12, "title": "Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTransactionsPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                }
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTransactionsPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTransactionsPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewTransactionsPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Transactions per second
function refreshTransactionsPerSecond(fixTimestamps) {
    var infos = transactionsPerSecondInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTransactionsPerSecond");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotTransactionsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTransactionsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTransactionsPerSecond", "#overviewTransactionsPerSecond");
        $('#footerTransactionsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var totalTPSInfos = {
        data: {"result": {"minY": 0.7833333333333333, "minX": 1.79390496E12, "maxY": 1.8166666666666667, "series": [{"data": [[1.79390496E12, 1.8166666666666667], [1.79390502E12, 0.7833333333333333]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79390502E12, "title": "Total Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTotalTPS"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                },
                colors: ["#9ACD32", "#FF6347"]
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTotalTPS"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTotalTPS"), dataset, options);
        // setup overview
        $.plot($("#overviewTotalTPS"), dataset, prepareOverviewOptions(options));
    }
};

// Total Transactions per second
function refreshTotalTPS(fixTimestamps) {
    var infos = totalTPSInfos;
    // We want to ignore seriesFilter
    prepareSeries(infos.data, false, true);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotTotalTPS"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTotalTPS");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTotalTPS", "#overviewTotalTPS");
        $('#footerTotalTPS .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

// Collapse the graph matching the specified DOM element depending the collapsed
// status
function collapse(elem, collapsed){
    if(collapsed){
        $(elem).parent().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    } else {
        $(elem).parent().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
        if (elem.id == "bodyBytesThroughputOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshBytesThroughputOverTime(true);
            }
            document.location.href="#bytesThroughputOverTime";
        } else if (elem.id == "bodyLatenciesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesOverTime(true);
            }
            document.location.href="#latenciesOverTime";
        } else if (elem.id == "bodyCustomGraph") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCustomGraph(true);
            }
            document.location.href="#responseCustomGraph";
        } else if (elem.id == "bodyConnectTimeOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshConnectTimeOverTime(true);
            }
            document.location.href="#connectTimeOverTime";
        } else if (elem.id == "bodyResponseTimePercentilesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimePercentilesOverTime(true);
            }
            document.location.href="#responseTimePercentilesOverTime";
        } else if (elem.id == "bodyResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeDistribution();
            }
            document.location.href="#responseTimeDistribution" ;
        } else if (elem.id == "bodySyntheticResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshSyntheticResponseTimeDistribution();
            }
            document.location.href="#syntheticResponseTimeDistribution" ;
        } else if (elem.id == "bodyActiveThreadsOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshActiveThreadsOverTime(true);
            }
            document.location.href="#activeThreadsOverTime";
        } else if (elem.id == "bodyTimeVsThreads") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTimeVsThreads();
            }
            document.location.href="#timeVsThreads" ;
        } else if (elem.id == "bodyCodesPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCodesPerSecond(true);
            }
            document.location.href="#codesPerSecond";
        } else if (elem.id == "bodyTransactionsPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTransactionsPerSecond(true);
            }
            document.location.href="#transactionsPerSecond";
        } else if (elem.id == "bodyTotalTPS") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTotalTPS(true);
            }
            document.location.href="#totalTPS";
        } else if (elem.id == "bodyResponseTimeVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeVsRequest();
            }
            document.location.href="#responseTimeVsRequest";
        } else if (elem.id == "bodyLatenciesVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesVsRequest();
            }
            document.location.href="#latencyVsRequest";
        }
    }
}

/*
 * Activates or deactivates all series of the specified graph (represented by id parameter)
 * depending on checked argument.
 */
function toggleAll(id, checked){
    var placeholder = document.getElementById(id);

    var cases = $(placeholder).find(':checkbox');
    cases.prop('checked', checked);
    $(cases).parent().children().children().toggleClass("legend-disabled", !checked);

    var choiceContainer;
    if ( id == "choicesBytesThroughputOverTime"){
        choiceContainer = $("#choicesBytesThroughputOverTime");
        refreshBytesThroughputOverTime(false);
    } else if(id == "choicesResponseTimesOverTime"){
        choiceContainer = $("#choicesResponseTimesOverTime");
        refreshResponseTimeOverTime(false);
    }else if(id == "choicesResponseCustomGraph"){
        choiceContainer = $("#choicesResponseCustomGraph");
        refreshCustomGraph(false);
    } else if ( id == "choicesLatenciesOverTime"){
        choiceContainer = $("#choicesLatenciesOverTime");
        refreshLatenciesOverTime(false);
    } else if ( id == "choicesConnectTimeOverTime"){
        choiceContainer = $("#choicesConnectTimeOverTime");
        refreshConnectTimeOverTime(false);
    } else if ( id == "choicesResponseTimePercentilesOverTime"){
        choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        refreshResponseTimePercentilesOverTime(false);
    } else if ( id == "choicesResponseTimePercentiles"){
        choiceContainer = $("#choicesResponseTimePercentiles");
        refreshResponseTimePercentiles();
    } else if(id == "choicesActiveThreadsOverTime"){
        choiceContainer = $("#choicesActiveThreadsOverTime");
        refreshActiveThreadsOverTime(false);
    } else if ( id == "choicesTimeVsThreads"){
        choiceContainer = $("#choicesTimeVsThreads");
        refreshTimeVsThreads();
    } else if ( id == "choicesSyntheticResponseTimeDistribution"){
        choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        refreshSyntheticResponseTimeDistribution();
    } else if ( id == "choicesResponseTimeDistribution"){
        choiceContainer = $("#choicesResponseTimeDistribution");
        refreshResponseTimeDistribution();
    } else if ( id == "choicesHitsPerSecond"){
        choiceContainer = $("#choicesHitsPerSecond");
        refreshHitsPerSecond(false);
    } else if(id == "choicesCodesPerSecond"){
        choiceContainer = $("#choicesCodesPerSecond");
        refreshCodesPerSecond(false);
    } else if ( id == "choicesTransactionsPerSecond"){
        choiceContainer = $("#choicesTransactionsPerSecond");
        refreshTransactionsPerSecond(false);
    } else if ( id == "choicesTotalTPS"){
        choiceContainer = $("#choicesTotalTPS");
        refreshTotalTPS(false);
    } else if ( id == "choicesResponseTimeVsRequest"){
        choiceContainer = $("#choicesResponseTimeVsRequest");
        refreshResponseTimeVsRequest();
    } else if ( id == "choicesLatencyVsRequest"){
        choiceContainer = $("#choicesLatencyVsRequest");
        refreshLatenciesVsRequest();
    }
    var color = checked ? "black" : "#818181";
    if(choiceContainer != null) {
        choiceContainer.find("label").each(function(){
            this.style.color = color;
        });
    }
}

