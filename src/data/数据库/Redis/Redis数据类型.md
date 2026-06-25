# Redis数据类型

## String（字符串）

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





## List（列表）

在redis里面，可以把list玩成栈、队列、阻塞队列

所有list命令都是用L开头的

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





## Set（集合）

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





## Hash（哈希）

相当于Map

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





## Zset（有序集合）

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


