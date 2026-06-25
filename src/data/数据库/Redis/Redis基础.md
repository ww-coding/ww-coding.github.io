# Redis基础

## 简介

Redis是一个开源( BSD许可)的,内存中的数据结构存储系统,它可以用作**数据库、缓存和消息中间件MQ**。它支持多种类型的数据结构,如字符串( strings)，散列( hashes) ,列表(lists)，集合(sets)，有序集合( sorted sets)与范围查询,bitmaps，hyperloglogs和地理空间( geospatial )索引半径查询。Redis 内置了复制(replication) , LUA脚本( Luascripting)，LRU驱动事件( LRU eviction) , 事务( transactions )和不同级别的磁盘持久化( persistence )， 并通过Redis哨兵( Sentinel )和自动分区( Cluster )提供高可用性( high availability)。





## 基础命令的使用

```bash
127.0.0.1:6379> keys *
1) "a6d67fc760183455c4873edbe90feccd"
2) "54387c3e9203809d6bb0288274769c43"
3) "oauth:client:details::web"
4) "5db802e935ab9bb62593d914b8bc1e26"
127.0.0.1:6379> flushdb		# 清除db内的所有数据
OK
127.0.0.1:6379> set name pzy	# 设置一个值
OK
127.0.0.1:6379> keys *		# 查看所有的key
1) "name"
127.0.0.1:6379> get name	# 获取key所对应的值
"pzy"
127.0.0.1:6379> EXISTS name		# 查看是否存在此key
(integer) 1
127.0.0.1:6379> MOVE name 1		# 移除key
(integer) 1
127.0.0.1:6379> EXPIRE name 10	# 设置key的过期时间
(integer) 1
127.0.0.1:6379> ttl name		# 查询key还有多长时间过期
(integer) 4
127.0.0.1:6379> ttl name		# 值为-2时说明key已经过期
(integer) -2
127.0.0.1:6379> get name		# 过期后key的值为nil
(nil)
127.0.0.1:6379> type name		# 获取key的类型
string
```

## 相关阅读

- [Redis数据类型](./Redis数据类型.md)
- [Redis特殊数据类型](./Redis特殊数据类型.md)
- [Redis持久化](./Redis持久化.md)
