# Redis特殊数据类型

## 地理空间( geospatial )

底层基于zset，所以可以使用zset的命令移除

```bash
127.0.0.1:6379> GEOADD china:city 116.397128 39.916527 beijing		# 添加地理位置(经度 纬度 名称)
(integer) 1
127.0.0.1:6379> GEOADD china:city 121.48941 31.40527 shanghai
(integer) 1
127.0.0.1:6379> GEOADD china:city 106.54041 29.40268 chongqing
(integer) 1
127.0.0.1:6379> GEOADD china:city 113.88308 22.55329 shenzhen
(integer) 1
127.0.0.1:6379> GEOADD china:city 87.615653 43.831501 xinjiang
(integer) 1
127.0.0.1:6379> GEOPOS china:city shanghai							# 获取某个值,可以获取多个值 
1) 1) "121.4894101023674"
   2) "31.405269938483805"
127.0.0.1:6379> GEODIST china:city chongqing xinjiang km			# 获取两个经纬度之间的距离,单位为km,默认是m,(还可以使用mi英里ft英尺)
"2319.5814"
127.0.0.1:6379> GEORADIUS china:city 110 30 1000 km					# 获取以100,30这个经纬度为中心,1000km内的城市
1) "chongqing"
2) "shenzhen"
127.0.0.1:6379> GEORADIUS china:city 110 30 1000 km withcoord withdist count 1  # 获取以100,30这个经纬度为中心,1000km内的城市具体经纬度,限制显示的个数
1) 1) "chongqing"
   2) "340.7667"
   3) 1) "106.54040783643723"
      2) "29.402680535172998"
127.0.0.1:6379> GEORADIUSBYMEMBER china:city shanghai 2000 km		# 找出位于指定元素周围的其他元素
1) "chongqing"
2) "shenzhen"
3) "shanghai"
127.0.0.1:6379> GEOHASH china:city shanghai chongqing				# 返回一个或多个位置元素的hash值,11位的hash
1) "wtw6st1uuq0"
2) "wm5z22s7520"
127.0.0.1:6379> ZRANGE china:city 0 -1								# 查询当前所以位置			
1) "xinjiang"
2) "chongqing"
3) "shenzhen"
4) "shanghai"
127.0.0.1:6379> ZREM china:city shanghai							# 移除某个位置
(integer) 1
127.0.0.1:6379> ZRANGE china:city 0 -1
1) "xinjiang"
2) "chongqing"
3) "shenzhen"
```





## HyperLogLog

Redis 在 2.8.9 版本添加了 HyperLogLog 结构。
Redis 是用来做基数统计的算法，HyperLogLog 的优点是，在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定 的、并且是很小的。
在 Redis 里面，每个 HyperLogLog 键只需要花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基 数。这和计算基数时，元素越多耗费内存就越多的集合形成鲜明对比。但是，**因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。**
**什么是基数?**
比如数据集 {1, 3, 5, 7, 5, 7, 8}， 那么这个数据集的基数集为 {1, 3, 5 ,7, 8}, 基数(不重复元素)为5。 基数估计就是在误差可接受的范围内，快速计算基数。

```bash
127.0.0.1:6379> PFADD mykey a b c d e f g			# 设置HyperLogLog值
(integer) 1
127.0.0.1:6379> PFCOUNT mykey						# 查询HyperLogLog的基数
(integer) 7
127.0.0.1:6379> PFADD mykey2 a b c d
(integer) 1
127.0.0.1:6379> PFCOUNT mykey2
(integer) 4
127.0.0.1:6379> PFMERGE mykey3 mykey mykey2			# 合并mykey、mykey2到mykey3中
OK
127.0.0.1:6379> PFCOUNT mykey3
(integer) 7
127.0.0.1:6379>
```





## bitmap

```bash
127.0.0.1:6379> SETBIT sign 0 1			# 设置bitmap值
(integer) 0
127.0.0.1:6379> SETBIT sign 1 0
(integer) 0
127.0.0.1:6379> SETBIT sign 2 1
(integer) 0
127.0.0.1:6379> SETBIT sign 3 1
(integer) 0
127.0.0.1:6379> GETBIT sign 3			# 获取bitmap值
(integer) 1
127.0.0.1:6379> GETBIT sign 0
(integer) 1
127.0.0.1:6379> BITCOUNT sign			# 统计值为1的数量
(integer) 3
```




