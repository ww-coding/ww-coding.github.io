# Redis数据类型

Redis 的核心价值不只是快，而是把不同业务问题映射到合适的数据结构。选错类型会导致命令复杂、内存浪费，甚至出现线上阻塞。

## 类型选择速查

| 类型 | 适合场景 | 核心能力 | 常见命令 |
|------|----------|----------|----------|
| String | 缓存值、计数器、分布式锁、简单对象 JSON | 字符串存储、自增自减、位操作 | `GET`、`SET`、`INCR`、`MGET` |
| List | 简单队列、最新列表、时间线 | 双端插入弹出、按范围读取 | `LPUSH`、`RPOP`、`LRANGE`、`BRPOP` |
| Set | 去重集合、标签、共同好友 | 去重、交并差集 | `SADD`、`SINTER`、`SUNION` |
| Hash | 对象属性、购物车、用户信息 | field-value 结构，适合局部更新 | `HSET`、`HGET`、`HINCRBY` |
| Zset | 排行榜、延时队列、权重排序 | score 排序、范围查询 | `ZADD`、`ZRANGE`、`ZREVRANGE` |

简单原则：单值用 String，对象用 Hash，去重用 Set，排序用 Zset，队列用 List 或 Stream。

## String（字符串）

String 是 Redis 最基础的数据类型，可以存文本、数字、JSON、二进制内容。虽然叫字符串，但很多业务计数器也是用 String 完成的。

### 典型场景

| 场景 | 示例 Key | 说明 |
|------|----------|------|
| 缓存对象 | `cache:user:1001` | value 可以是 JSON 字符串 |
| 计数器 | `article:1001:views` | 使用 `INCR`、`INCRBY` 原子递增 |
| 分布式锁 | `lock:order:1001` | 使用 `SET key value NX EX seconds` |
| 验证码 | `captcha:phone:13800138000` | 设置短 TTL |
| 限流计数 | `rate:user:1001:20240626` | 配合过期时间实现窗口计数 |

```bash
127.0.0.1:6379> append name 123		# 在值的后面追加字符串，如果当前key不存在就相当于setkey
(integer) 6
127.0.0.1:6379> get name
"pzy123"
127.0.0.1:6379> strlen name			# 获取字符串的长度
(integer) 6
127.0.0.1:6379> set view 0
OK
127.0.0.1:6379> get view
"0"
127.0.0.1:6379> incr view			# 自增1
(integer) 1
127.0.0.1:6379> incr view
(integer) 2
127.0.0.1:6379> get view
"2"
127.0.0.1:6379> decr view			# 自减1
(integer) 1
127.0.0.1:6379> decr view
(integer) 0
127.0.0.1:6379> get view
"0"
127.0.0.1:6379> INCRBY view 10		# 可以设置步长设置增量
(integer) 10
127.0.0.1:6379> INCRBY view 10
(integer) 20
127.0.0.1:6379> DECRBY view 10		# 可以设置步长设置减量
(integer) 10
127.0.0.1:6379> GETRANGE name 0 3	# 截取字符串的长度，下标从0开始
"pzy1"
127.0.0.1:6379> SETRANGE name 3 666	# 替换指定位置开始的值
(integer) 6
127.0.0.1:6379> get name
"pzy666"
127.0.0.1:6379> setex age 30 "100"	# 设置一个值并且设置过期时间（set with expire）
OK
127.0.0.1:6379> get age
"100"
127.0.0.1:6379> ttl age				
(integer) 16
127.0.0.1:6379> setnx age 1000		# 不存在这个key才会去设置值（set if not exist）,分布式锁中会常常使用 
(integer) 0
127.0.0.1:6379> get age
"100"
127.0.0.1:6379> mset k1 v1 k2 v2 k3 v3		# 量设置值
OK
127.0.0.1:6379> keys *
1) "k2"
2) "k1"
3) "k3"
127.0.0.1:6379> mget k1 k2 k3				#批量获取值
1) "v1"
2) "v2"
3) "v3"
127.0.0.1:6379> msetnx k1 v1 k5 v5			# 是一个原子性操作,要么一起成功，要么一起失败
(integer) 0
127.0.0.1:6379> keys *
1) "k2"
2) "k1"
3) "k3"
127.0.0.1:6379> mset user:1:name pzy user:1:age 20		# 设置一个key，中间冒号隔开，在项目中可以分组区分是哪个模块下的缓存
OK
127.0.0.1:6379> mget user:1:name user:1:age				# 获取也可以使用这种key的方式获取值
1) "pzy"
2) "20"
127.0.0.1:6379> getset db redis							# 先get旧值再set新值，如果不存在值为nil
(nil)
127.0.0.1:6379> get db
"redis"
127.0.0.1:6379> getset db mongdb
"redis"
```

### 使用注意

- `SETNX` 单独使用容易出现死锁，分布式锁应使用 `SET key value NX EX seconds`。
- 大对象 JSON 放在 String 中会导致每次更新都需要整体读写，字段频繁更新时更适合 Hash。
- `MGET`、`MSET` 能减少网络往返，但一次操作的 Key 不要过多。
- 计数器类 Key 要考虑是否需要设置过期时间，否则会长期增长。





## List（列表）

在redis里面，可以把list玩成栈、队列、阻塞队列

所有list命令都是用L开头的

List 是有序的字符串列表，支持从头尾两端插入和弹出。它适合做轻量队列，但不适合复杂消息队列场景；如果需要消费者组、ACK、重试，优先考虑 Redis Stream 或专业 MQ。

### 典型场景

| 场景 | 写入方式 | 读取方式 |
|------|----------|----------|
| 栈 | `LPUSH` | `LPOP` |
| 队列 | `LPUSH` | `RPOP` / `BRPOP` |
| 最新动态 | `LPUSH` 后 `LTRIM` | `LRANGE` |
| 简单任务队列 | `LPUSH` | `BRPOP` 阻塞等待 |

```bash
127.0.0.1:6379> LPUSH list one two three		# 往list中插入值，插入到列表头部
(integer) 3
127.0.0.1:6379> LRANGE list 0 -1				# 获取list中的全部值
1) "three"
2) "two"
3) "one"
127.0.0.1:6379> LRANGE list 0 1					# 获取下标[0,1]的值
1) "three"
2) "two"
127.0.0.1:6379> RPUSH list zero					# 往list中插入值，插入到列表尾部
(integer) 4
127.0.0.1:6379> LRANGE list 0 -1
1) "three"
2) "two"
3) "one"
4) "zero"
127.0.0.1:6379> LPOP list						# 移除头部一个值（第一个值）
"three"
127.0.0.1:6379> RPOP list						# 移除尾部一个值（最后一个值）
"zero"
127.0.0.1:6379> LRANGE list 0 -1			
1) "two"
2) "one"
127.0.0.1:6379> LINDEX list 1					# 通过下标获取list中的某一个值	
"one"
127.0.0.1:6379> LINDEX list 0
"two"
127.0.0.1:6379> LLEN list						# 获取list长度
(integer) 2
127.0.0.1:6379> LPUSH list zero three three
(integer) 4
127.0.0.1:6379> LRANGE list 0 -1
1) "three"
2) "three"
3) "zero"
4) "two"
5) "one"
127.0.0.1:6379> LREM list 1 one					# 移除一个值为one的元素
(integer) 1
127.0.0.1:6379> LREM list 1 three				# 移除一个值为three的元素（参数3为移除个数）
(integer) 1
127.0.0.1:6379> LRANGE list 0 -1
1) "three"
2) "zero"
3) "two"
127.0.0.1:6379> LTRIM list 1 2					# 通过下标截取指定长度，并重新赋值到list中
OK
127.0.0.1:6379> LRANGE list 0 -1
1) "zero"
2) "two"
127.0.0.1:6379> RPOPLPUSH list mylist			# 将list中的最后一个元素移除，并添加到新的集合中
"two"
127.0.0.1:6379> LRANGE list 0 -1
1) "zero"
127.0.0.1:6379> LRANGE mylist 0 -1
1) "two"
127.0.0.1:6379> LSET list 0 item				# 将指定下标的元素替换，下标不存在报错
OK
127.0.0.1:6379> LRANGE list 0 -1
1) "item"
127.0.0.1:6379> LINSERT list before item hello	# 将某个值插入到集合某元素前面
(integer) 2
127.0.0.1:6379> LINSERT list after item world	# 将某个值插入到集合某元素后面
(integer) 3
127.0.0.1:6379> LRANGE list 0 -1
1) "hello"
2) "item"
3) "world"
```

### 使用注意

- `LRANGE key 0 -1` 会一次性返回全部元素，列表很大时容易造成网络和内存压力。
- 用 List 做消息队列时，消费者弹出后如果处理失败，消息可能丢失。
- 最新列表可以用 `LPUSH + LTRIM` 控制长度，例如只保留最近 100 条。
- 随机访问 List 中间元素效率不如数组，不适合频繁按下标读写。





## Set（集合）

Set 是无序、去重的集合，适合表达“某个对象属于哪些集合”或“集合之间的关系”。

### 典型场景

| 场景 | 设计方式 | 使用命令 |
|------|----------|----------|
| 标签系统 | `tag:java:articles` 存文章 ID | `SADD`、`SMEMBERS` |
| 用户关注 | `user:1:follows` 存关注用户 ID | `SISMEMBER`、`SCARD` |
| 共同好友 | 两个用户好友集合求交集 | `SINTER` |
| 抽奖 | 活动参与用户集合随机弹出 | `SRANDMEMBER`、`SPOP` |
| 去重统计 | 把访问用户 ID 加入集合 | `SADD`、`SCARD` |

```bash
127.0.0.1:6379> SADD set hello zhangsan lisi wangwu			# 往set集合中添加元素
(integer) 4
127.0.0.1:6379> SMEMBERS set								# 查看set中的所有值
1) "wangwu"
2) "hello"
3) "zhangsan"
4) "lisi"
127.0.0.1:6379> SISMEMBER set hello							# 判断某一个值存不存在，存在返回1，不存在返回0
(integer) 1
127.0.0.1:6379> SISMEMBER set world
(integer) 0
127.0.0.1:6379> SCARD set									# 获取set的长度
(integer) 4
127.0.0.1:6379> SREM set hello								# 移除set中的指定元素
(integer) 1
127.0.0.1:6379> SMEMBERS set
1) "wangwu"
2) "zhangsan"
3) "lisi"
127.0.0.1:6379> SRANDMEMBER set								# 随机获取指定个数个值，默认取一个
"lisi"
127.0.0.1:6379> SRANDMEMBER set
"lisi"
127.0.0.1:6379> SRANDMEMBER set
"zhangsan"
127.0.0.1:6379> SRANDMEMBER set 2
1) "wangwu"
2) "lisi"
127.0.0.1:6379> SPOP set									# 随机删除指定个数个值，默认取一个
"lisi"
127.0.0.1:6379> SMEMBERS set
1) "wangwu"
2) "zhangsan"
127.0.0.1:6379> SMOVE set myset wangwu						# 将指定元素从一个集合移动到另外一个集合
(integer) 1
127.0.0.1:6379> SMEMBERS set
1) "zhangsan"
127.0.0.1:6379> SMEMBERS myset
1) "wangwu"
127.0.0.1:6379> SADD set wangwu
(integer) 1
127.0.0.1:6379> SDIFF set myset								# 差集
1) "zhangsan"
127.0.0.1:6379> SINTER set myset							# 交集
1) "wangwu"
127.0.0.1:6379> SUNION set myset							# 并集
1) "wangwu"
2) "zhangsan"
```

### 使用注意

- `SMEMBERS` 会返回全集合，大 Set 在线上应谨慎使用。
- 集合运算如 `SINTER`、`SUNION` 可能比较耗时，大集合建议离线处理或控制规模。
- 只需要基数统计且不需要精确成员时，可以考虑 HyperLogLog。
- `SPOP` 会删除元素，抽奖场景要确认是否允许“抽中即移除”。





## Hash（哈希）

相当于Map

Hash 适合存储对象的多个字段，例如用户资料、商品摘要、购物车条目。相比把整个对象 JSON 放在 String 中，Hash 可以局部更新字段。

### 典型场景

| 场景 | 示例 Key | Field 示例 |
|------|----------|------------|
| 用户资料 | `user:1001` | `name`、`age`、`email` |
| 商品库存摘要 | `product:2001` | `stock`、`price`、`status` |
| 购物车 | `cart:user:1001` | `skuId -> count` |
| 配置项 | `config:app` | `timeout`、`switch` |

```bash
127.0.0.1:6379> HSET myhash key1 val1					# 设置hash值
(integer) 1
127.0.0.1:6379> hget myhash key1						# 获取一个hash值
"val1"
127.0.0.1:6379> HMSET myhash key1 hello key2 world		# 批量设置hash值
OK
127.0.0.1:6379> HMGET myhash key1 key2					# 批量获取hash值
1) "hello"
2) "world"
127.0.0.1:6379> HGETALL myhash							# 获取全部的hash值
1) "key1"
2) "hello"
3) "key2"
4) "world"
127.0.0.1:6379> HDEL myhash key2						# 删除指定的hash值
(integer) 1
127.0.0.1:6379> HGETALL myhash
1) "key1"
2) "hello"
127.0.0.1:6379> HLEN myhash								# 获取hash的长度
(integer) 1
127.0.0.1:6379> HEXISTS myhash key1						#  判断某一个值存不存在，存在返回1，不存在返回0
(integer) 1
127.0.0.1:6379> HEXISTS myhash key2
(integer) 0
127.0.0.1:6379> HKEYS myhash							# 获取hash中的所以key
1) "key1"
127.0.0.1:6379> HVALS myhash							# 获取hash中的所以value
1) "hello"
127.0.0.1:6379> HSET myhash key2 5						# 设置一个数值类型的hash
(integer) 1
127.0.0.1:6379> HINCRBY myhash key2 1					# value加一
(integer) 6
127.0.0.1:6379> HINCRBY myhash key2 -1					# value减一
(integer) 5
127.0.0.1:6379> HSETNX myhash key3 hello				# 设置一个hash值，如果不存在则添加，如果存在则不改变值
(integer) 1
127.0.0.1:6379> HSETNX myhash key3 world
(integer) 0
127.0.0.1:6379> HGET key3
(error) ERR wrong number of arguments for 'hget' command
127.0.0.1:6379> HGET myhash key3
"hello"
```

### 使用注意

- Hash 适合字段数量有限的对象，不适合把超大对象无限塞进一个 Key。
- `HGETALL` 会返回所有字段，大 Hash 要避免频繁全量读取。
- Redis 4.0 之后 `HMSET` 仍可用，但官方更推荐直接用 `HSET` 设置多个 field。
- 对象字段需要单独过期时，Hash 不支持 field 级 TTL，只能给整个 Key 设置过期时间。





## Zset（有序集合）

Zset 是 Set + score 的组合：成员唯一，但每个成员都有一个分数，Redis 会按 score 排序。它是排行榜、优先级队列、延时队列的核心结构。

### 典型场景

| 场景 | score 设计 | 查询方式 |
|------|------------|----------|
| 排行榜 | 分数、积分、热度 | `ZREVRANGE` |
| 延时队列 | 到期时间戳 | `ZRANGEBYSCORE` |
| 热门文章 | 浏览/点赞综合得分 | `ZREVRANGE` |
| 权重排序 | 商品权重、推荐分 | `ZRANGE` / `ZREVRANGE` |
| 时间线索引 | 发布时间戳 | 按时间范围查询 |

```bash
127.0.0.1:6379> ZADD zset 1 val1 2 val2 3 val3		# 设置zset值
(integer) 3	
127.0.0.1:6379> ZRANGE zset 0 -1					# 获取所有的zset值	
1) "val1"
2) "val2"
3) "val3"
127.0.0.1:6379> zadd salary 5000 zhangsan 8000 liai 4000 wangwu		
(integer) 3
127.0.0.1:6379> ZRANGEBYSCORE salary -inf +inf		# 排序从负无穷到正无穷(也就是从小到大排序)
1) "wangwu"
2) "zhangsan"
3) "liai"
127.0.0.1:6379> ZRANGEBYSCORE salary -inf +inf withscores		# 显示用户全部信息,从小到大
1) "wangwu"
2) "4000"
3) "zhangsan"
4) "5000"
5) "liai"
6) "8000"
127.0.0.1:6379> ZRANGEBYSCORE salary -inf 5000 withscores		 
1) "wangwu"
2) "4000"
3) "zhangsan"
4) "5000"
127.0.0.1:6379> ZREVRANGE salary 0 -1				# 从大到小排序
1) "liai"
2) "zhangsan"
3) "wangwu"
127.0.0.1:6379> ZRANGE zset 0 -1
1) "val1"
2) "val2"
3) "val3"
127.0.0.1:6379> ZREM zset val3						# 移除某一元素
(integer) 1
127.0.0.1:6379> ZRANGE zset 0 -1
1) "val1"
2) "val2"
127.0.0.1:6379> ZCARD zset							# 获取zset的长度
(integer) 2
127.0.0.1:6379> ZCOUNT zset -inf +inf				# 获取指定区间的数量
(integer) 2
```

### 使用注意

- score 是浮点数，涉及金额等强精度场景不要直接用小数金额做 score。
- 排行榜通常用 `ZREVRANGE` 从高到低取，普通排序用 `ZRANGE` 从低到高取。
- 延时队列需要业务侧轮询取到期元素，并用原子方式删除，避免多消费者重复处理。
- Zset 成员唯一，重复 `ZADD` 同一个 member 会更新分数。

## 数据类型选型案例

| 业务需求 | 推荐类型 | 原因 |
|----------|----------|------|
| 用户详情缓存 | Hash / String | 字段频繁更新用 Hash，整体读写用 String |
| 文章阅读量 | String | `INCR` 原子递增简单高效 |
| 最近 100 条通知 | List | `LPUSH + LTRIM` 控制长度 |
| 用户共同关注 | Set | 交集计算直接表达业务语义 |
| 游戏积分榜 | Zset | 天然按分数排序 |
| 每日签到 | Bitmap | 每天一个 bit，内存占用低 |
| 页面 UV | HyperLogLog | 不要求完全精确时成本极低 |

## 大 Key 风险

大 Key 指单个 Key 的 value 很大，或者集合类型元素数量过多。它会带来删除阻塞、网络传输慢、备份恢复慢、主从同步压力大等问题。

常见治理方式：

- 使用 `SCAN`、`HSCAN`、`SSCAN`、`ZSCAN` 分批处理。
- 删除大 Key 时优先用 `UNLINK`，避免主线程同步释放内存。
- 将超大集合拆分成多个分片 Key，例如 `user:feed:1001:0`、`user:feed:1001:1`。
- 对列表、排行榜、日志类数据设置最大长度，避免无限增长。


