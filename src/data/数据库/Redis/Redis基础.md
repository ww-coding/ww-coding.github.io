# Redis基础

## 简介

Redis（**RE**mote **DI**ctionary **S**erver）是一个开源（BSD 许可）的，内存中的数据结构存储系统，它可以用作**数据库、缓存和消息中间件（MQ）**。由 Salvatore Sanfilippo（网名 antirez）于 2009 年首次发布，使用 ANSI C 语言编写。

Redis 支持多种类型的数据结构，如字符串（strings）、散列（hashes）、列表（lists）、集合（sets）、有序集合（sorted sets）与范围查询、bitmaps、hyperloglogs 和地理空间（geospatial）索引半径查询。Redis 内置了复制（replication）、LUA 脚本（Lua scripting）、LRU 驱动事件（LRU eviction）、事务（transactions）和不同级别的磁盘持久化（persistence），并通过 Redis 哨兵（Sentinel）和自动分区（Cluster）提供高可用性（high availability）。

---

## 学习路线

Redis 的学习不要从命令背诵开始，而应该先建立整体模型，再回到具体数据结构。

1. 先掌握 Key 的通用操作：过期时间、类型查看、删除、遍历。
2. 再掌握五种基础数据类型：String、List、Set、Hash、Zset。
3. 接着理解三种特殊结构：Bitmap、HyperLogLog、Geo。
4. 然后学习持久化、主从复制、哨兵、Cluster 等可用性能力。
5. 最后结合缓存一致性、分布式锁、限流、排行榜等业务场景使用。

如果只是做业务开发，前 3 步已经能覆盖大部分日常需求；如果负责线上 Redis 集群，还必须理解持久化、内存淘汰、慢查询和高可用。

---

## 为什么选择 Redis？

| 特性 | 说明 |
|------|------|
| **极高性能** | 基于内存操作，读写速度可达 10w+ QPS（单机） |
| **丰富的数据结构** | 支持 String、List、Set、Zset、Hash、Bitmap、HyperLogLog、Geo、Stream 等 |
| **原子性操作** | 所有命令都是原子性的，支持事务（MULTI/EXEC） |
| **持久化** | 支持 RDB 快照和 AOF 日志两种持久化方式 |
| **高可用** | 主从复制 + 哨兵模式 + Cluster 集群模式 |
| **发布订阅** | 内置 Pub/Sub 消息系统 |
| **Lua 脚本** | 支持 Lua 脚本，可实现复杂的原子操作 |
| **过期策略** | 支持 key 过期时间设置，内存淘汰策略灵活 |

---

## 核心概念

### 1. 内存存储

Redis 将所有数据存储在内存中，因此读写速度极快。但这也意味着数据量受内存大小限制，需要合理设计数据结构和过期策略。

### 2. 单线程模型

Redis 6.0 之前，网络 I/O 和命令执行都是单线程的。Redis 6.0 引入了多线程 I/O，但**命令执行仍然是单线程的**。

**单线程为什么还能这么快？**
- 纯内存操作，没有磁盘 I/O 瓶颈
- 基于 `epoll`/`kqueue` 的多路复用 I/O 模型，非阻塞
- 避免了多线程的上下文切换和锁竞争开销

### 3. Key-Value 结构

Redis 是典型的 Key-Value 数据库，每个 Key 对应一个 Value。Key 的命名通常使用冒号 `:` 分隔，形成层级结构：

```
user:1001:name    → "张三"
user:1001:email   → "zhangsan@example.com"
order:20240101:1  → "{...}"
```

### 4. 数据库切换

Redis 默认有 16 个数据库（db0 ~ db15），使用 `SELECT index` 切换。**注意：Redis Cluster 模式下只支持 db0。**

```bash
127.0.0.1:6379> SELECT 1    # 切换到 1 号数据库
OK
127.0.0.1:6379[1]> SELECT 0  # 切回 0 号数据库
OK
```

---

## 基础命令的使用

### Key 操作相关

```bash
127.0.0.1:6379> keys *
1) "a6d67fc760183455c4873edbe90feccd"
2) "54387c3e9203809d6bb0288274769c43"
3) "oauth:client:details::web"
4) "5db802e935ab9bb62593d914b8bc1e26"
127.0.0.1:6379> flushdb		# 清除当前db内的所有数据
OK
127.0.0.1:6379> flushall	# 清除所有db的所有数据（谨慎使用！）
OK
127.0.0.1:6379> set name pzy	# 设置一个值
OK
127.0.0.1:6379> keys *		# 查看所有的key
1) "name"
127.0.0.1:6379> get name	# 获取key所对应的值
"pzy"
127.0.0.1:6379> EXISTS name		# 查看是否存在此key
(integer) 1
127.0.0.1:6379> MOVE name 1		# 将key移动到1号数据库
(integer) 1
127.0.0.1:6379> EXPIRE name 10	# 设置key的过期时间为10秒
(integer) 1
127.0.0.1:6379> ttl name		# 查询key还有多长时间过期（单位：秒）
(integer) 4
127.0.0.1:6379> ttl name		# 值为-2时说明key已经过期
(integer) -2
127.0.0.1:6379> get name		# 过期后key的值为nil
(nil)
127.0.0.1:6379> type name		# 获取key对应value的类型
string
```

### 更多 Key 操作命令

```bash
# DEL — 删除指定的 key（可一次性删除多个）
127.0.0.1:6379> SET k1 v1
OK
127.0.0.1:6379> SET k2 v2
OK
127.0.0.1:6379> DEL k1 k2
(integer) 2

# UNLINK — 异步删除 key（Redis 4.0+，非阻塞，适合删除大 key）
127.0.0.1:6379> SET bigkey "large value..."
OK
127.0.0.1:6379> UNLINK bigkey
(integer) 1

# PERSIST — 移除 key 的过期时间，使其永久有效
127.0.0.1:6379> SET temp val EX 100
OK
127.0.0.1:6379> TTL temp
(integer) 96
127.0.0.1:6379> PERSIST temp
(integer) 1
127.0.0.1:6379> TTL temp
(integer) -1      # -1 表示永久有效

# PTTL — 同 TTL，但以毫秒为单位返回
127.0.0.1:6379> SET temp val EX 10
OK
127.0.0.1:6379> PTTL temp
(integer) 8234    # 剩余毫秒数

# EXPIREAT — 以 Unix 时间戳（秒）设置过期时间
127.0.0.1:6379> EXPIREAT name 1717200000
(integer) 1

# RENAME — 重命名 key
127.0.0.1:6379> SET old_name "hello"
OK
127.0.0.1:6379> RENAME old_name new_name
OK
127.0.0.1:6379> GET new_name
"hello"

# RENAMENX — 仅当 newkey 不存在时才重命名
127.0.0.1:6379> SET a v1
OK
127.0.0.1:6379> SET b v2
OK
127.0.0.1:6379> RENAMENX a b
(integer) 0       # b 已存在，重命名失败

# RANDOMKEY — 随机返回一个 key
127.0.0.1:6379> RANDOMKEY
"k1"

# SCAN — 迭代遍历 key（生产环境推荐使用，避免 KEYS * 阻塞）
# SCAN cursor [MATCH pattern] [COUNT count]
127.0.0.1:6379> SCAN 0 MATCH user:* COUNT 10
1) "15"           # 下一次迭代的游标，返回 0 表示遍历结束
2) 1) "user:1"
   2) "user:2"

# DUMP / RESTORE — 序列化与反序列化 key
127.0.0.1:6379> SET msg "hello"
OK
127.0.0.1:6379> DUMP msg
"\x00\x05hello\t\x00\xbd\xc0\xc1\xfb\xa2\xb0F\x84"
```

### TTL 返回值含义速查

| 返回值 | 含义 |
|--------|------|
| `正整数` | 剩余过期时间（秒） |
| `-1` | key 存在但没有设置过期时间（永久有效） |
| `-2` | key 不存在（已过期或被删除） |

---

## 常见使用场景

### 1. 缓存（Cache）

这是 Redis 最常见的用途。将热点数据缓存在 Redis 中，减少数据库压力。

```
用户请求 → Redis（缓存层）→ 命中返回
                          → 未命中 → 查询数据库 → 写入 Redis → 返回
```

**常见模式：**
- **Cache Aside**（旁路缓存）：应用程序同时操作缓存和数据库
- **Read/Write Through**：缓存作为数据读写的中介
- **Write Behind**（异步写入）：先写缓存，异步批量写数据库

### 2. 分布式锁

利用 `SETNX` 命令实现分布式锁：

```bash
# 获取锁（NX：不存在才设置，EX：过期时间防止死锁）
SET lock:order:1001 unique_value NX EX 30

# 释放锁（Lua 脚本保证原子性：先判断值再删除）
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
```

### 3. 计数器

利用 `INCR`/`INCRBY` 实现文章阅读量、点赞数、库存扣减等：

```bash
INCR article:100:views     # 文章阅读量+1
INCRBY product:200:stock -1  # 商品库存-1（秒杀场景）
```

### 4. 消息队列

利用 List 的阻塞命令实现简单的消息队列：

```bash
# Producer
LPUSH queue:tasks "task_data"

# Consumer（阻塞等待）
BRPOP queue:tasks 0    # 0 表示无限等待
```

Redis 5.0 引入了更强大的 **Stream** 类型，支持消费者组、消息确认等高级特性。

### 5. 排行榜

利用 Zset（有序集合）实现实时排行榜：

```bash
ZADD rank:game 1000 player1 850 player2 920 player3
ZREVRANGE rank:game 0 9 WITHSCORES    # Top 10
```

### 6. 社交关系

利用 Set 的交集、并集、差集实现共同好友、可能认识的人等：

```bash
SADD user:1:friends 2 3 4 5
SADD user:2:friends 1 3 5 6
SINTER user:1:friends user:2:friends   # 共同好友 → {3, 5}
```

### 7. 限流

利用过期时间 + 计数器实现简单限流：

```bash
# 基于滑动窗口的简单限流
INCR rate_limit:user:1001
EXPIRE rate_limit:user:1001 60     # 60秒窗口
# 如果计数超过阈值，则拒绝请求
```

---

## Key 命名最佳实践

| 原则 | 说明 | 示例 |
|------|------|------|
| **可读性** | 使用冒号分层，见名知义 | `user:1001:profile` |
| **简洁性** | 在可读的前提下尽量短 | ✅ `u:1001:name` ❌ `the_name_of_user_1001` |
| **统一前缀** | 便于分组管理和清理 | `cache:`, `lock:`, `counter:` |
| **避免特殊字符** | 不要使用空格、换行等 | ✅ `order:2024:01` ❌ `order 2024` |
| **大小写规范** | 统一使用小写 | ✅ `user:profile` ❌ `User:Profile` |
| **不要过长** | Key 过长会占用更多内存 | 建议控制在 50 字符以内 |

---

## Redis 与其它数据库对比

| 对比维度 | Redis | Memcached | MySQL | MongoDB |
|----------|-------|-----------|-------|---------|
| **数据存储** | 内存 + 磁盘持久化 | 纯内存 | 磁盘为主 | 磁盘为主 |
| **数据结构** | 丰富（10+ 种） | 仅 String | 关系型表 | JSON 文档 |
| **持久化** | RDB + AOF | 不支持 | 强支持 | 强支持 |
| **事务** | 简单事务 | 不支持 | ACID | 多文档事务 |
| **集群** | Sentinel + Cluster | 客户端分片 | 主从/分库分表 | 副本集/分片 |
| **典型场景** | 缓存/计数器/排行榜 | 纯缓存 | 业务数据存储 | 文档/日志存储 |
| **最大内存** | 受限于物理内存 | 受限于物理内存 | 无限制 | 无限制 |

---

## 安装与启动

### 本地启动

```bash
# 启动 Redis 服务端
redis-server

# 指定配置文件启动
redis-server /path/to/redis.conf

# 启动 Redis 客户端
redis-cli

# 连接远程 Redis
redis-cli -h 192.168.1.100 -p 6379 -a your_password

# 测试连通性
127.0.0.1:6379> PING
PONG

# 查看服务信息
127.0.0.1:6379> INFO
# 查看指定模块信息
127.0.0.1:6379> INFO memory
127.0.0.1:6379> INFO stats
127.0.0.1:6379> INFO replication
```

### 配置文件重要参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `port` | 6379 | 监听端口 |
| `bind` | 127.0.0.1 | 绑定地址 |
| `requirepass` | (空) | 访问密码 |
| `maxmemory` | 0（不限制） | 最大内存 |
| `maxmemory-policy` | noeviction | 内存淘汰策略 |
| `save` | 900 1 / 300 10 / 60 10000 | RDB 快照触发条件 |
| `appendonly` | no | 是否开启 AOF |
| `databases` | 16 | 数据库数量 |
| `daemonize` | no | 是否后台运行 |

---

## 生产环境注意事项

| 检查项 | 建议 |
|--------|------|
| 禁用危险命令 | 对 `FLUSHALL`、`FLUSHDB`、`KEYS` 等命令做重命名或权限控制 |
| 避免大 Key | 单个 String 不宜过大，Hash/List/Set/Zset 元素数量也要控制 |
| 慎用 `KEYS *` | 生产环境使用 `SCAN` 分批遍历，避免阻塞主线程 |
| 设置过期时间 | 缓存类 Key 应设置 TTL，避免长期占用内存 |
| 配置最大内存 | 使用 `maxmemory` 和淘汰策略限制内存风险 |
| 开启监控 | 关注内存、连接数、慢查询、命中率、复制延迟 |
| 持久化策略 | 根据业务容忍的数据丢失范围选择 RDB、AOF 或混合模式 |
| 连接池控制 | 客户端连接池不要无限放大，避免 Redis 连接数被打满 |

常见线上问题一般不是 Redis “不够快”，而是 Key 设计不合理、大 Key 阻塞、缓存击穿、连接数失控或持久化配置不符合业务预期。

---

## 相关阅读

- [Redis数据类型](./Redis数据类型.md)
- [Redis特殊数据类型](./Redis特殊数据类型.md)
- [Redis持久化](./Redis持久化.md)
