# Redis特殊数据类型

Redis 除了五种基础数据类型，还提供了一些面向特定场景的结构。它们的共同特点是：用更低的内存成本解决某类固定问题，但使用边界更明显。

| 类型 | 解决的问题 | 是否精确 | 典型场景 |
|------|------------|----------|----------|
| Geo | 经纬度位置计算 | 精确到 Redis GeoHash 能力范围 | 附近门店、附近的人 |
| HyperLogLog | 大规模去重计数 | 近似统计 | UV、独立访客、搜索词去重 |
| Bitmap | 大量布尔状态记录 | 精确 | 签到、在线状态、用户标签 |

## 地理空间( geospatial )

底层基于zset，所以可以使用zset的命令移除

Geo 用来存储经纬度并进行距离计算、范围查询。它底层使用 Zset，因此可以用 `ZREM`、`ZRANGE` 等 Zset 命令管理成员。

### 适用场景

- 查找用户附近的门店、司机、设备。
- 计算两个地点之间的直线距离。
- 按城市或业务区域维护位置索引。

### 常用命令

| 命令 | 作用 |
|------|------|
| `GEOADD` | 添加经纬度和成员 |
| `GEOPOS` | 获取成员经纬度 |
| `GEODIST` | 计算两个成员距离 |
| `GEORADIUS` | 按经纬度查找附近成员 |
| `GEORADIUSBYMEMBER` | 按某个成员查找附近成员 |
| `GEOHASH` | 返回位置的 GeoHash 字符串 |

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

### 使用注意

- Redis Geo 适合“附近”类粗粒度查询，不适合复杂 GIS 场景，比如多边形区域、路线规划。
- 经纬度顺序是 longitude、latitude，也就是先经度后纬度。
- `GEORADIUS` 在新版本中逐步推荐使用 `GEOSEARCH` 替代，但旧命令仍常见。
- 如果数据量很大，应按城市、业务区域拆 Key，避免一个 Geo Key 过大。





## HyperLogLog

Redis 在 2.8.9 版本添加了 HyperLogLog 结构。
Redis 是用来做基数统计的算法，HyperLogLog 的优点是，在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定 的、并且是很小的。
在 Redis 里面，每个 HyperLogLog 键只需要花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基 数。这和计算基数时，元素越多耗费内存就越多的集合形成鲜明对比。但是，**因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。**
**什么是基数?**
比如数据集 {1, 3, 5, 7, 5, 7, 8}， 那么这个数据集的基数集为 {1, 3, 5 ,7, 8}, 基数(不重复元素)为5。 基数估计就是在误差可接受的范围内，快速计算基数。

### 适用场景

HyperLogLog 适合只关心“有多少个不同元素”，不关心“具体有哪些元素”的场景。

| 场景 | Key 设计 | 说明 |
|------|----------|------|
| 页面 UV | `uv:page:1001:20240626` | 统计当天访问过页面的独立用户数 |
| 搜索词去重 | `search:keyword:20240626` | 统计当天不同搜索词数量 |
| 活跃用户数 | `dau:20240626` | 统计日活用户 |
| 多天合并统计 | `dau:202406` | 使用 `PFMERGE` 合并多个日维度 Key |

### 与 Set 的区别

| 对比项 | Set | HyperLogLog |
|--------|-----|-------------|
| 是否保存成员 | 保存 | 不保存 |
| 统计是否精确 | 精确 | 近似 |
| 能否列出成员 | 可以 | 不可以 |
| 内存占用 | 随成员数增长 | 基本固定 |
| 适合场景 | 需要成员明细 | 只需要去重数量 |

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

### 使用注意

- HyperLogLog 有误差，不适合订单金额、库存、计费这类必须精确的场景。
- 它不能判断某个元素是否存在，也不能取出元素列表。
- 如果元素量很小，Set 更直观；当元素量很大且只关心数量时，HyperLogLog 更合适。





## bitmap

Bitmap 本质上是 String 的位操作能力，把每一位当成一个布尔值。它非常适合记录大量 yes/no 状态，例如签到、是否活跃、是否具备某个标签。

### 适用场景

| 场景 | 位偏移设计 | 查询方式 |
|------|------------|----------|
| 用户签到 | 第几天作为 offset | `GETBIT` 查看某天是否签到 |
| 月活统计 | 用户 ID 作为 offset | `BITCOUNT` 统计活跃人数 |
| 在线状态 | 用户 ID 作为 offset | `SETBIT` 标记上下线 |
| 标签过滤 | 用户 ID 作为 offset | `BITOP` 做交并差组合 |

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

### 常用位运算

```bash
# 统计 sign 中为 1 的位数量
BITCOUNT sign

# 对多个 bitmap 做与运算，结果写入 result
BITOP AND result bitmap:tag:a bitmap:tag:b

# 对多个 bitmap 做或运算
BITOP OR result bitmap:active:day1 bitmap:active:day2
```

### 使用注意

- offset 过大会导致 Redis 分配从 0 到 offset 的整段空间，所以用户 ID 很稀疏时要谨慎。
- Bitmap 适合布尔状态，不适合保存复杂值。
- `BITCOUNT` 统计大 Bitmap 时可能消耗 CPU，可以按字节范围分段统计。

## 选型建议

| 需求 | 推荐结构 | 原因 |
|------|----------|------|
| 需要附近位置查询 | Geo | 原生支持距离和半径查询 |
| 只需要 UV 数量 | HyperLogLog | 内存固定，适合大规模去重计数 |
| 需要精确保存访问用户列表 | Set | 可以查询具体成员 |
| 需要记录每日签到 | Bitmap | 每天只占 1 bit |
| 需要多个标签组合过滤 | Bitmap / Set | 大规模布尔过滤用 Bitmap，小规模集合运算用 Set |



