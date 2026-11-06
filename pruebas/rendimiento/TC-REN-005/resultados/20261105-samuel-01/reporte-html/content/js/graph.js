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
        data: {"result": {"minY": 375.0, "minX": 0.0, "maxY": 6270.0, "series": [{"data": [[0.0, 375.0], [0.1, 375.0], [0.2, 375.0], [0.3, 375.0], [0.4, 375.0], [0.5, 375.0], [0.6, 375.0], [0.7, 375.0], [0.8, 463.0], [0.9, 463.0], [1.0, 463.0], [1.1, 463.0], [1.2, 463.0], [1.3, 463.0], [1.4, 463.0], [1.5, 464.0], [1.6, 464.0], [1.7, 464.0], [1.8, 464.0], [1.9, 464.0], [2.0, 464.0], [2.1, 464.0], [2.2, 482.0], [2.3, 482.0], [2.4, 482.0], [2.5, 482.0], [2.6, 482.0], [2.7, 482.0], [2.8, 482.0], [2.9, 631.0], [3.0, 631.0], [3.1, 631.0], [3.2, 631.0], [3.3, 631.0], [3.4, 631.0], [3.5, 631.0], [3.6, 640.0], [3.7, 640.0], [3.8, 640.0], [3.9, 640.0], [4.0, 640.0], [4.1, 640.0], [4.2, 640.0], [4.3, 669.0], [4.4, 669.0], [4.5, 669.0], [4.6, 669.0], [4.7, 669.0], [4.8, 669.0], [4.9, 669.0], [5.0, 682.0], [5.1, 682.0], [5.2, 682.0], [5.3, 682.0], [5.4, 682.0], [5.5, 682.0], [5.6, 682.0], [5.7, 692.0], [5.8, 692.0], [5.9, 692.0], [6.0, 692.0], [6.1, 692.0], [6.2, 692.0], [6.3, 692.0], [6.4, 704.0], [6.5, 704.0], [6.6, 704.0], [6.7, 704.0], [6.8, 704.0], [6.9, 704.0], [7.0, 704.0], [7.1, 734.0], [7.2, 734.0], [7.3, 734.0], [7.4, 734.0], [7.5, 734.0], [7.6, 734.0], [7.7, 734.0], [7.8, 745.0], [7.9, 745.0], [8.0, 745.0], [8.1, 745.0], [8.2, 745.0], [8.3, 745.0], [8.4, 745.0], [8.5, 754.0], [8.6, 754.0], [8.7, 754.0], [8.8, 754.0], [8.9, 754.0], [9.0, 754.0], [9.1, 754.0], [9.2, 754.0], [9.3, 754.0], [9.4, 754.0], [9.5, 754.0], [9.6, 754.0], [9.7, 754.0], [9.8, 754.0], [9.9, 772.0], [10.0, 772.0], [10.1, 772.0], [10.2, 772.0], [10.3, 772.0], [10.4, 772.0], [10.5, 772.0], [10.6, 779.0], [10.7, 779.0], [10.8, 779.0], [10.9, 779.0], [11.0, 779.0], [11.1, 779.0], [11.2, 779.0], [11.3, 786.0], [11.4, 786.0], [11.5, 786.0], [11.6, 786.0], [11.7, 786.0], [11.8, 786.0], [11.9, 786.0], [12.0, 787.0], [12.1, 787.0], [12.2, 787.0], [12.3, 787.0], [12.4, 787.0], [12.5, 787.0], [12.6, 787.0], [12.7, 788.0], [12.8, 788.0], [12.9, 788.0], [13.0, 788.0], [13.1, 788.0], [13.2, 788.0], [13.3, 788.0], [13.4, 790.0], [13.5, 790.0], [13.6, 790.0], [13.7, 790.0], [13.8, 790.0], [13.9, 790.0], [14.0, 790.0], [14.1, 797.0], [14.2, 797.0], [14.3, 797.0], [14.4, 797.0], [14.5, 797.0], [14.6, 797.0], [14.7, 797.0], [14.8, 799.0], [14.9, 799.0], [15.0, 799.0], [15.1, 799.0], [15.2, 799.0], [15.3, 799.0], [15.4, 799.0], [15.5, 811.0], [15.6, 811.0], [15.7, 811.0], [15.8, 811.0], [15.9, 811.0], [16.0, 811.0], [16.1, 811.0], [16.2, 813.0], [16.3, 813.0], [16.4, 813.0], [16.5, 813.0], [16.6, 813.0], [16.7, 813.0], [16.8, 813.0], [16.9, 813.0], [17.0, 829.0], [17.1, 829.0], [17.2, 829.0], [17.3, 829.0], [17.4, 829.0], [17.5, 829.0], [17.6, 829.0], [17.7, 842.0], [17.8, 842.0], [17.9, 842.0], [18.0, 842.0], [18.1, 842.0], [18.2, 842.0], [18.3, 842.0], [18.4, 850.0], [18.5, 850.0], [18.6, 850.0], [18.7, 850.0], [18.8, 850.0], [18.9, 850.0], [19.0, 850.0], [19.1, 854.0], [19.2, 854.0], [19.3, 854.0], [19.4, 854.0], [19.5, 854.0], [19.6, 854.0], [19.7, 854.0], [19.8, 855.0], [19.9, 855.0], [20.0, 855.0], [20.1, 855.0], [20.2, 855.0], [20.3, 855.0], [20.4, 855.0], [20.5, 862.0], [20.6, 862.0], [20.7, 862.0], [20.8, 862.0], [20.9, 862.0], [21.0, 862.0], [21.1, 862.0], [21.2, 866.0], [21.3, 866.0], [21.4, 866.0], [21.5, 866.0], [21.6, 866.0], [21.7, 866.0], [21.8, 866.0], [21.9, 896.0], [22.0, 896.0], [22.1, 896.0], [22.2, 896.0], [22.3, 896.0], [22.4, 896.0], [22.5, 896.0], [22.6, 907.0], [22.7, 907.0], [22.8, 907.0], [22.9, 907.0], [23.0, 907.0], [23.1, 907.0], [23.2, 907.0], [23.3, 908.0], [23.4, 908.0], [23.5, 908.0], [23.6, 908.0], [23.7, 908.0], [23.8, 908.0], [23.9, 908.0], [24.0, 922.0], [24.1, 922.0], [24.2, 922.0], [24.3, 922.0], [24.4, 922.0], [24.5, 922.0], [24.6, 922.0], [24.7, 923.0], [24.8, 923.0], [24.9, 923.0], [25.0, 923.0], [25.1, 923.0], [25.2, 923.0], [25.3, 923.0], [25.4, 927.0], [25.5, 927.0], [25.6, 927.0], [25.7, 927.0], [25.8, 927.0], [25.9, 927.0], [26.0, 927.0], [26.1, 931.0], [26.2, 931.0], [26.3, 931.0], [26.4, 931.0], [26.5, 931.0], [26.6, 931.0], [26.7, 931.0], [26.8, 940.0], [26.9, 940.0], [27.0, 940.0], [27.1, 940.0], [27.2, 940.0], [27.3, 940.0], [27.4, 940.0], [27.5, 942.0], [27.6, 942.0], [27.7, 942.0], [27.8, 942.0], [27.9, 942.0], [28.0, 942.0], [28.1, 942.0], [28.2, 957.0], [28.3, 957.0], [28.4, 957.0], [28.5, 957.0], [28.6, 957.0], [28.7, 957.0], [28.8, 957.0], [28.9, 963.0], [29.0, 963.0], [29.1, 963.0], [29.2, 963.0], [29.3, 963.0], [29.4, 963.0], [29.5, 963.0], [29.6, 963.0], [29.7, 963.0], [29.8, 963.0], [29.9, 963.0], [30.0, 963.0], [30.1, 963.0], [30.2, 963.0], [30.3, 981.0], [30.4, 981.0], [30.5, 981.0], [30.6, 981.0], [30.7, 981.0], [30.8, 981.0], [30.9, 981.0], [31.0, 985.0], [31.1, 985.0], [31.2, 985.0], [31.3, 985.0], [31.4, 985.0], [31.5, 985.0], [31.6, 985.0], [31.7, 1003.0], [31.8, 1003.0], [31.9, 1003.0], [32.0, 1003.0], [32.1, 1003.0], [32.2, 1003.0], [32.3, 1003.0], [32.4, 1011.0], [32.5, 1011.0], [32.6, 1011.0], [32.7, 1011.0], [32.8, 1011.0], [32.9, 1011.0], [33.0, 1011.0], [33.1, 1015.0], [33.2, 1015.0], [33.3, 1015.0], [33.4, 1015.0], [33.5, 1015.0], [33.6, 1015.0], [33.7, 1015.0], [33.8, 1015.0], [33.9, 1039.0], [34.0, 1039.0], [34.1, 1039.0], [34.2, 1039.0], [34.3, 1039.0], [34.4, 1039.0], [34.5, 1039.0], [34.6, 1039.0], [34.7, 1039.0], [34.8, 1039.0], [34.9, 1039.0], [35.0, 1039.0], [35.1, 1039.0], [35.2, 1039.0], [35.3, 1044.0], [35.4, 1044.0], [35.5, 1044.0], [35.6, 1044.0], [35.7, 1044.0], [35.8, 1044.0], [35.9, 1044.0], [36.0, 1060.0], [36.1, 1060.0], [36.2, 1060.0], [36.3, 1060.0], [36.4, 1060.0], [36.5, 1060.0], [36.6, 1060.0], [36.7, 1085.0], [36.8, 1085.0], [36.9, 1085.0], [37.0, 1085.0], [37.1, 1085.0], [37.2, 1085.0], [37.3, 1085.0], [37.4, 1092.0], [37.5, 1092.0], [37.6, 1092.0], [37.7, 1092.0], [37.8, 1092.0], [37.9, 1092.0], [38.0, 1092.0], [38.1, 1094.0], [38.2, 1094.0], [38.3, 1094.0], [38.4, 1094.0], [38.5, 1094.0], [38.6, 1094.0], [38.7, 1094.0], [38.8, 1109.0], [38.9, 1109.0], [39.0, 1109.0], [39.1, 1109.0], [39.2, 1109.0], [39.3, 1109.0], [39.4, 1109.0], [39.5, 1126.0], [39.6, 1126.0], [39.7, 1126.0], [39.8, 1126.0], [39.9, 1126.0], [40.0, 1126.0], [40.1, 1126.0], [40.2, 1129.0], [40.3, 1129.0], [40.4, 1129.0], [40.5, 1129.0], [40.6, 1129.0], [40.7, 1129.0], [40.8, 1129.0], [40.9, 1149.0], [41.0, 1149.0], [41.1, 1149.0], [41.2, 1149.0], [41.3, 1149.0], [41.4, 1149.0], [41.5, 1149.0], [41.6, 1150.0], [41.7, 1150.0], [41.8, 1150.0], [41.9, 1150.0], [42.0, 1150.0], [42.1, 1150.0], [42.2, 1150.0], [42.3, 1151.0], [42.4, 1151.0], [42.5, 1151.0], [42.6, 1151.0], [42.7, 1151.0], [42.8, 1151.0], [42.9, 1151.0], [43.0, 1162.0], [43.1, 1162.0], [43.2, 1162.0], [43.3, 1162.0], [43.4, 1162.0], [43.5, 1162.0], [43.6, 1162.0], [43.7, 1179.0], [43.8, 1179.0], [43.9, 1179.0], [44.0, 1179.0], [44.1, 1179.0], [44.2, 1179.0], [44.3, 1179.0], [44.4, 1183.0], [44.5, 1183.0], [44.6, 1183.0], [44.7, 1183.0], [44.8, 1183.0], [44.9, 1183.0], [45.0, 1183.0], [45.1, 1187.0], [45.2, 1187.0], [45.3, 1187.0], [45.4, 1187.0], [45.5, 1187.0], [45.6, 1187.0], [45.7, 1187.0], [45.8, 1223.0], [45.9, 1223.0], [46.0, 1223.0], [46.1, 1223.0], [46.2, 1223.0], [46.3, 1223.0], [46.4, 1223.0], [46.5, 1242.0], [46.6, 1242.0], [46.7, 1242.0], [46.8, 1242.0], [46.9, 1242.0], [47.0, 1242.0], [47.1, 1242.0], [47.2, 1244.0], [47.3, 1244.0], [47.4, 1244.0], [47.5, 1244.0], [47.6, 1244.0], [47.7, 1244.0], [47.8, 1244.0], [47.9, 1245.0], [48.0, 1245.0], [48.1, 1245.0], [48.2, 1245.0], [48.3, 1245.0], [48.4, 1245.0], [48.5, 1245.0], [48.6, 1259.0], [48.7, 1259.0], [48.8, 1259.0], [48.9, 1259.0], [49.0, 1259.0], [49.1, 1259.0], [49.2, 1259.0], [49.3, 1286.0], [49.4, 1286.0], [49.5, 1286.0], [49.6, 1286.0], [49.7, 1286.0], [49.8, 1286.0], [49.9, 1286.0], [50.0, 1349.0], [50.1, 1349.0], [50.2, 1349.0], [50.3, 1349.0], [50.4, 1349.0], [50.5, 1349.0], [50.6, 1349.0], [50.7, 1349.0], [50.8, 1356.0], [50.9, 1356.0], [51.0, 1356.0], [51.1, 1356.0], [51.2, 1356.0], [51.3, 1356.0], [51.4, 1356.0], [51.5, 1362.0], [51.6, 1362.0], [51.7, 1362.0], [51.8, 1362.0], [51.9, 1362.0], [52.0, 1362.0], [52.1, 1362.0], [52.2, 1380.0], [52.3, 1380.0], [52.4, 1380.0], [52.5, 1380.0], [52.6, 1380.0], [52.7, 1380.0], [52.8, 1380.0], [52.9, 1380.0], [53.0, 1380.0], [53.1, 1380.0], [53.2, 1380.0], [53.3, 1380.0], [53.4, 1380.0], [53.5, 1380.0], [53.6, 1383.0], [53.7, 1383.0], [53.8, 1383.0], [53.9, 1383.0], [54.0, 1383.0], [54.1, 1383.0], [54.2, 1383.0], [54.3, 1393.0], [54.4, 1393.0], [54.5, 1393.0], [54.6, 1393.0], [54.7, 1393.0], [54.8, 1393.0], [54.9, 1393.0], [55.0, 1397.0], [55.1, 1397.0], [55.2, 1397.0], [55.3, 1397.0], [55.4, 1397.0], [55.5, 1397.0], [55.6, 1397.0], [55.7, 1397.0], [55.8, 1397.0], [55.9, 1397.0], [56.0, 1397.0], [56.1, 1397.0], [56.2, 1397.0], [56.3, 1397.0], [56.4, 1402.0], [56.5, 1402.0], [56.6, 1402.0], [56.7, 1402.0], [56.8, 1402.0], [56.9, 1402.0], [57.0, 1402.0], [57.1, 1434.0], [57.2, 1434.0], [57.3, 1434.0], [57.4, 1434.0], [57.5, 1434.0], [57.6, 1434.0], [57.7, 1434.0], [57.8, 1473.0], [57.9, 1473.0], [58.0, 1473.0], [58.1, 1473.0], [58.2, 1473.0], [58.3, 1473.0], [58.4, 1473.0], [58.5, 1497.0], [58.6, 1497.0], [58.7, 1497.0], [58.8, 1497.0], [58.9, 1497.0], [59.0, 1497.0], [59.1, 1497.0], [59.2, 1506.0], [59.3, 1506.0], [59.4, 1506.0], [59.5, 1506.0], [59.6, 1506.0], [59.7, 1506.0], [59.8, 1506.0], [59.9, 1509.0], [60.0, 1509.0], [60.1, 1509.0], [60.2, 1509.0], [60.3, 1509.0], [60.4, 1509.0], [60.5, 1509.0], [60.6, 1521.0], [60.7, 1521.0], [60.8, 1521.0], [60.9, 1521.0], [61.0, 1521.0], [61.1, 1521.0], [61.2, 1521.0], [61.3, 1531.0], [61.4, 1531.0], [61.5, 1531.0], [61.6, 1531.0], [61.7, 1531.0], [61.8, 1531.0], [61.9, 1531.0], [62.0, 1533.0], [62.1, 1533.0], [62.2, 1533.0], [62.3, 1533.0], [62.4, 1533.0], [62.5, 1533.0], [62.6, 1533.0], [62.7, 1574.0], [62.8, 1574.0], [62.9, 1574.0], [63.0, 1574.0], [63.1, 1574.0], [63.2, 1574.0], [63.3, 1574.0], [63.4, 1591.0], [63.5, 1591.0], [63.6, 1591.0], [63.7, 1591.0], [63.8, 1591.0], [63.9, 1591.0], [64.0, 1591.0], [64.1, 1618.0], [64.2, 1618.0], [64.3, 1618.0], [64.4, 1618.0], [64.5, 1618.0], [64.6, 1618.0], [64.7, 1618.0], [64.8, 1631.0], [64.9, 1631.0], [65.0, 1631.0], [65.1, 1631.0], [65.2, 1631.0], [65.3, 1631.0], [65.4, 1631.0], [65.5, 1669.0], [65.6, 1669.0], [65.7, 1669.0], [65.8, 1669.0], [65.9, 1669.0], [66.0, 1669.0], [66.1, 1669.0], [66.2, 1717.0], [66.3, 1717.0], [66.4, 1717.0], [66.5, 1717.0], [66.6, 1717.0], [66.7, 1717.0], [66.8, 1717.0], [66.9, 1717.0], [67.0, 1773.0], [67.1, 1773.0], [67.2, 1773.0], [67.3, 1773.0], [67.4, 1773.0], [67.5, 1773.0], [67.6, 1773.0], [67.7, 1774.0], [67.8, 1774.0], [67.9, 1774.0], [68.0, 1774.0], [68.1, 1774.0], [68.2, 1774.0], [68.3, 1774.0], [68.4, 1798.0], [68.5, 1798.0], [68.6, 1798.0], [68.7, 1798.0], [68.8, 1798.0], [68.9, 1798.0], [69.0, 1798.0], [69.1, 1856.0], [69.2, 1856.0], [69.3, 1856.0], [69.4, 1856.0], [69.5, 1856.0], [69.6, 1856.0], [69.7, 1856.0], [69.8, 1882.0], [69.9, 1882.0], [70.0, 1882.0], [70.1, 1882.0], [70.2, 1882.0], [70.3, 1882.0], [70.4, 1882.0], [70.5, 1968.0], [70.6, 1968.0], [70.7, 1968.0], [70.8, 1968.0], [70.9, 1968.0], [71.0, 1968.0], [71.1, 1968.0], [71.2, 1988.0], [71.3, 1988.0], [71.4, 1988.0], [71.5, 1988.0], [71.6, 1988.0], [71.7, 1988.0], [71.8, 1988.0], [71.9, 2050.0], [72.0, 2050.0], [72.1, 2050.0], [72.2, 2050.0], [72.3, 2050.0], [72.4, 2050.0], [72.5, 2050.0], [72.6, 2058.0], [72.7, 2058.0], [72.8, 2058.0], [72.9, 2058.0], [73.0, 2058.0], [73.1, 2058.0], [73.2, 2058.0], [73.3, 2092.0], [73.4, 2092.0], [73.5, 2092.0], [73.6, 2092.0], [73.7, 2092.0], [73.8, 2092.0], [73.9, 2092.0], [74.0, 2102.0], [74.1, 2102.0], [74.2, 2102.0], [74.3, 2102.0], [74.4, 2102.0], [74.5, 2102.0], [74.6, 2102.0], [74.7, 2109.0], [74.8, 2109.0], [74.9, 2109.0], [75.0, 2109.0], [75.1, 2109.0], [75.2, 2109.0], [75.3, 2109.0], [75.4, 2203.0], [75.5, 2203.0], [75.6, 2203.0], [75.7, 2203.0], [75.8, 2203.0], [75.9, 2203.0], [76.0, 2203.0], [76.1, 2206.0], [76.2, 2206.0], [76.3, 2206.0], [76.4, 2206.0], [76.5, 2206.0], [76.6, 2206.0], [76.7, 2206.0], [76.8, 2331.0], [76.9, 2331.0], [77.0, 2331.0], [77.1, 2331.0], [77.2, 2331.0], [77.3, 2331.0], [77.4, 2331.0], [77.5, 2493.0], [77.6, 2493.0], [77.7, 2493.0], [77.8, 2493.0], [77.9, 2493.0], [78.0, 2493.0], [78.1, 2493.0], [78.2, 2537.0], [78.3, 2537.0], [78.4, 2537.0], [78.5, 2537.0], [78.6, 2537.0], [78.7, 2537.0], [78.8, 2537.0], [78.9, 2608.0], [79.0, 2608.0], [79.1, 2608.0], [79.2, 2608.0], [79.3, 2608.0], [79.4, 2608.0], [79.5, 2608.0], [79.6, 2619.0], [79.7, 2619.0], [79.8, 2619.0], [79.9, 2619.0], [80.0, 2619.0], [80.1, 2619.0], [80.2, 2619.0], [80.3, 2662.0], [80.4, 2662.0], [80.5, 2662.0], [80.6, 2662.0], [80.7, 2662.0], [80.8, 2662.0], [80.9, 2662.0], [81.0, 2666.0], [81.1, 2666.0], [81.2, 2666.0], [81.3, 2666.0], [81.4, 2666.0], [81.5, 2666.0], [81.6, 2666.0], [81.7, 2734.0], [81.8, 2734.0], [81.9, 2734.0], [82.0, 2734.0], [82.1, 2734.0], [82.2, 2734.0], [82.3, 2734.0], [82.4, 2770.0], [82.5, 2770.0], [82.6, 2770.0], [82.7, 2770.0], [82.8, 2770.0], [82.9, 2770.0], [83.0, 2770.0], [83.1, 2936.0], [83.2, 2936.0], [83.3, 2936.0], [83.4, 2936.0], [83.5, 2936.0], [83.6, 2936.0], [83.7, 2936.0], [83.8, 2936.0], [83.9, 2970.0], [84.0, 2970.0], [84.1, 2970.0], [84.2, 2970.0], [84.3, 2970.0], [84.4, 2970.0], [84.5, 2970.0], [84.6, 2986.0], [84.7, 2986.0], [84.8, 2986.0], [84.9, 2986.0], [85.0, 2986.0], [85.1, 2986.0], [85.2, 2986.0], [85.3, 3869.0], [85.4, 3869.0], [85.5, 3869.0], [85.6, 3869.0], [85.7, 3869.0], [85.8, 3869.0], [85.9, 3869.0], [86.0, 3947.0], [86.1, 3947.0], [86.2, 3947.0], [86.3, 3947.0], [86.4, 3947.0], [86.5, 3947.0], [86.6, 3947.0], [86.7, 4014.0], [86.8, 4014.0], [86.9, 4014.0], [87.0, 4014.0], [87.1, 4014.0], [87.2, 4014.0], [87.3, 4014.0], [87.4, 4077.0], [87.5, 4077.0], [87.6, 4077.0], [87.7, 4077.0], [87.8, 4077.0], [87.9, 4077.0], [88.0, 4077.0], [88.1, 4360.0], [88.2, 4360.0], [88.3, 4360.0], [88.4, 4360.0], [88.5, 4360.0], [88.6, 4360.0], [88.7, 4360.0], [88.8, 4431.0], [88.9, 4431.0], [89.0, 4431.0], [89.1, 4431.0], [89.2, 4431.0], [89.3, 4431.0], [89.4, 4431.0], [89.5, 4667.0], [89.6, 4667.0], [89.7, 4667.0], [89.8, 4667.0], [89.9, 4667.0], [90.0, 4667.0], [90.1, 4667.0], [90.2, 4769.0], [90.3, 4769.0], [90.4, 4769.0], [90.5, 4769.0], [90.6, 4769.0], [90.7, 4769.0], [90.8, 4769.0], [90.9, 4990.0], [91.0, 4990.0], [91.1, 4990.0], [91.2, 4990.0], [91.3, 4990.0], [91.4, 4990.0], [91.5, 4990.0], [91.6, 5145.0], [91.7, 5145.0], [91.8, 5145.0], [91.9, 5145.0], [92.0, 5145.0], [92.1, 5145.0], [92.2, 5145.0], [92.3, 5373.0], [92.4, 5373.0], [92.5, 5373.0], [92.6, 5373.0], [92.7, 5373.0], [92.8, 5373.0], [92.9, 5373.0], [93.0, 5512.0], [93.1, 5512.0], [93.2, 5512.0], [93.3, 5512.0], [93.4, 5512.0], [93.5, 5512.0], [93.6, 5512.0], [93.7, 5536.0], [93.8, 5536.0], [93.9, 5536.0], [94.0, 5536.0], [94.1, 5536.0], [94.2, 5536.0], [94.3, 5536.0], [94.4, 5652.0], [94.5, 5652.0], [94.6, 5652.0], [94.7, 5652.0], [94.8, 5652.0], [94.9, 5652.0], [95.0, 5652.0], [95.1, 5726.0], [95.2, 5726.0], [95.3, 5726.0], [95.4, 5726.0], [95.5, 5726.0], [95.6, 5726.0], [95.7, 5726.0], [95.8, 5769.0], [95.9, 5769.0], [96.0, 5769.0], [96.1, 5769.0], [96.2, 5769.0], [96.3, 5769.0], [96.4, 5769.0], [96.5, 5989.0], [96.6, 5989.0], [96.7, 5989.0], [96.8, 5989.0], [96.9, 5989.0], [97.0, 5989.0], [97.1, 5989.0], [97.2, 6040.0], [97.3, 6040.0], [97.4, 6040.0], [97.5, 6040.0], [97.6, 6040.0], [97.7, 6040.0], [97.8, 6040.0], [97.9, 6093.0], [98.0, 6093.0], [98.1, 6093.0], [98.2, 6093.0], [98.3, 6093.0], [98.4, 6093.0], [98.5, 6093.0], [98.6, 6096.0], [98.7, 6096.0], [98.8, 6096.0], [98.9, 6096.0], [99.0, 6096.0], [99.1, 6096.0], [99.2, 6096.0], [99.3, 6270.0], [99.4, 6270.0], [99.5, 6270.0], [99.6, 6270.0], [99.7, 6270.0], [99.8, 6270.0], [99.9, 6270.0]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
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
        data: {"result": {"minY": 1.0, "minX": 300.0, "maxY": 13.0, "series": [{"data": [[600.0, 5.0], [700.0, 13.0], [800.0, 10.0], [900.0, 13.0], [1000.0, 10.0], [1100.0, 10.0], [1200.0, 6.0], [1300.0, 9.0], [1400.0, 4.0], [1500.0, 7.0], [1600.0, 3.0], [1700.0, 4.0], [1800.0, 2.0], [1900.0, 2.0], [2000.0, 3.0], [2100.0, 2.0], [2300.0, 1.0], [2200.0, 2.0], [2400.0, 1.0], [2500.0, 1.0], [2600.0, 4.0], [2700.0, 2.0], [2900.0, 3.0], [3800.0, 1.0], [3900.0, 1.0], [4000.0, 2.0], [4300.0, 1.0], [4600.0, 1.0], [4400.0, 1.0], [4700.0, 1.0], [300.0, 1.0], [4900.0, 1.0], [5100.0, 1.0], [5300.0, 1.0], [5600.0, 1.0], [5500.0, 2.0], [5700.0, 2.0], [6000.0, 3.0], [5900.0, 1.0], [6200.0, 1.0], [400.0, 3.0]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 6200.0, "title": "Response Time Distribution"}},
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
        data: {"result": {"minY": 4.0, "minX": 0.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 80.0, "series": [{"data": [[0.0, 4.0]], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [[1.0, 80.0]], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 58.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 2.0, "title": "Synthetic Response Times Distribution"}},
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
        data: {"result": {"minY": 4.9230769230769225, "minX": 1.79390484E12, "maxY": 5.0, "series": [{"data": [[1.7939049E12, 5.0], [1.79390484E12, 4.9230769230769225]], "isOverall": false, "label": "5 usuario(s) virtual(es)", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7939049E12, "title": "Active Threads Over Time"}},
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
        data: {"result": {"minY": 1068.5, "minX": 3.0, "maxY": 1910.5289855072463, "series": [{"data": [[4.0, 1068.5], [5.0, 1910.5289855072463], [3.0, 1814.5]], "isOverall": false, "label": "Consulta P1", "isController": false}, {"data": [[4.95774647887324, 1897.3169014084503]], "isOverall": false, "label": "Consulta P1-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 5.0, "title": "Time VS Threads"}},
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
        data : {"result": {"minY": 283.73333333333335, "minX": 1.79390484E12, "maxY": 378126.43333333335, "series": [{"data": [[1.7939049E12, 310257.48333333334], [1.79390484E12, 378126.43333333335]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.7939049E12, 283.73333333333335], [1.79390484E12, 345.8]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7939049E12, "title": "Bytes Throughput Over Time"}},
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
        data: {"result": {"minY": 1699.8333333333333, "minX": 1.79390484E12, "maxY": 2138.0000000000014, "series": [{"data": [[1.7939049E12, 2138.0000000000014], [1.79390484E12, 1699.8333333333333]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7939049E12, "title": "Response Time Over Time"}},
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
        data: {"result": {"minY": 1214.0128205128203, "minX": 1.79390484E12, "maxY": 1417.2968749999998, "series": [{"data": [[1.7939049E12, 1417.2968749999998], [1.79390484E12, 1214.0128205128203]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7939049E12, "title": "Latencies Over Time"}},
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
        data: {"result": {"minY": 5.281250000000002, "minX": 1.79390484E12, "maxY": 5.717948717948719, "series": [{"data": [[1.7939049E12, 5.281250000000002], [1.79390484E12, 5.717948717948719]], "isOverall": false, "label": "Consulta P1", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7939049E12, "title": "Connect Time Over Time"}},
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
        data: {"result": {"minY": 375.0, "minX": 1.79390484E12, "maxY": 6270.0, "series": [{"data": [[1.7939049E12, 6270.0], [1.79390484E12, 6093.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.7939049E12, 375.0], [1.79390484E12, 754.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.7939049E12, 5442.5], [1.79390484E12, 2754.2000000000016]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.7939049E12, 6270.0], [1.79390484E12, 6093.0]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.7939049E12, 1169.0], [1.79390484E12, 1380.0]], "isOverall": false, "label": "Median", "isController": false}, {"data": [[1.7939049E12, 6027.25], [1.79390484E12, 5655.7]], "isOverall": false, "label": "95th percentile", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7939049E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
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
    data: {"result": {"minY": 745.0, "minX": 1.0, "maxY": 4431.0, "series": [{"data": [[1.0, 2517.0], [2.0, 2203.0], [4.0, 1673.0], [5.0, 1179.0], [3.0, 1953.0], [6.0, 745.0], [7.0, 4431.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 7.0, "title": "Response Time Vs Request"}},
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
    data: {"result": {"minY": 474.0, "minX": 1.0, "maxY": 2911.0, "series": [{"data": [[1.0, 1261.5], [2.0, 993.5], [4.0, 1115.5], [5.0, 867.0], [3.0, 1222.5], [6.0, 474.0], [7.0, 2911.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 7.0, "title": "Latencies Vs Request"}},
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
        data: {"result": {"minY": 0.9833333333333333, "minX": 1.79390484E12, "maxY": 1.3833333333333333, "series": [{"data": [[1.7939049E12, 0.9833333333333333], [1.79390484E12, 1.3833333333333333]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7939049E12, "title": "Hits Per Second"}},
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
        data: {"result": {"minY": 1.0666666666666667, "minX": 1.79390484E12, "maxY": 1.3, "series": [{"data": [[1.7939049E12, 1.0666666666666667], [1.79390484E12, 1.3]], "isOverall": false, "label": "202", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7939049E12, "title": "Codes Per Second"}},
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
        data: {"result": {"minY": 1.0666666666666667, "minX": 1.79390484E12, "maxY": 1.3, "series": [{"data": [[1.7939049E12, 1.0666666666666667], [1.79390484E12, 1.3]], "isOverall": false, "label": "Consulta P1-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7939049E12, "title": "Transactions Per Second"}},
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
        data: {"result": {"minY": 1.0666666666666667, "minX": 1.79390484E12, "maxY": 1.3, "series": [{"data": [[1.7939049E12, 1.0666666666666667], [1.79390484E12, 1.3]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7939049E12, "title": "Total Transactions Per Second"}},
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

