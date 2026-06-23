---
title: Linux 防火墙 firewalld 端口与 IP 访问控制
index: true
cover: /images/linux-firewalld-wechat-cover.png
category:
  - Linux
  - 防火墙
tag:
  - firewalld
  - firewall-cmd
  - 端口开放
---

`firewalld` 是 CentOS、Red Hat、Rocky Linux、AlmaLinux 等系统中常见的动态防火墙管理工具。日常部署服务时，最常见的操作就是开放端口、关闭端口、限制指定 IP 访问，或只允许指定网段访问某个服务端口。

本文记录 `firewall-cmd` 的常用命令，适合在排查服务端口不通、临时放行服务、限制访问来源时快速查阅。

## 基础概念

执行防火墙规则时，需要注意下面几个点：

- `--permanent` 表示永久生效，写入配置文件。
- 带 `--permanent` 的规则不会立即生效，需要执行 `firewall-cmd --reload`。
- 不带 `--permanent` 的规则会立即生效，但重启防火墙或系统后失效。
- 默认区域通常是 `public`，不确定时可以先查看当前默认区域。

```bash
firewall-cmd --get-default-zone
```

## firewalld 服务管理

### 查看防火墙状态

```bash
systemctl status firewalld
```

### 启动防火墙

```bash
systemctl start firewalld
```

### 关闭防火墙

```bash
systemctl stop firewalld
```

### 设置开机启用

```bash
systemctl enable firewalld
```

### 设置开机禁用

```bash
systemctl disable firewalld
```

### 重启防火墙

```bash
systemctl restart firewalld
```

也可以使用：

```bash
service firewalld restart
```

### 重新加载配置

修改永久规则后，执行下面命令让配置生效：

```bash
firewall-cmd --reload
```

## 端口开放与关闭

### 查看已经开放的端口

```bash
firewall-cmd --list-ports
```

如果需要查看指定区域的端口：

```bash
firewall-cmd --zone=public --list-ports
```

### 开放单个端口

以开放 `80/tcp` 为例：

```bash
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --reload
```

### 关闭单个端口

以关闭 `80/tcp` 为例：

```bash
firewall-cmd --zone=public --remove-port=80/tcp --permanent
firewall-cmd --reload
```

### 批量开放端口

开放 `80` 到 `90` 之间的所有 TCP 端口：

```bash
firewall-cmd --zone=public --add-port=80-90/tcp --permanent
firewall-cmd --reload
```

### 批量关闭端口

关闭 `80` 到 `90` 之间的所有 TCP 端口：

```bash
firewall-cmd --zone=public --remove-port=80-90/tcp --permanent
firewall-cmd --reload
```

## IP 访问限制

`rich-rule` 可以按来源 IP、网段、端口、协议设置更细的访问规则。常见动作有：

- `accept`：允许访问。
- `reject`：拒绝访问，并返回拒绝信息。
- `drop`：直接丢弃请求，不返回响应。

### 限制单个 IP 访问端口

限制 `192.168.1.100` 访问 `80/tcp`：

```bash
firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='192.168.1.100' port protocol='tcp' port='80' reject"
firewall-cmd --reload
```

### 限制一个网段访问端口

限制 `192.168.3.0/24` 网段访问 `80/tcp`：

```bash
firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='192.168.3.0/24' port protocol='tcp' port='80' reject"
firewall-cmd --reload
```

### 允许单个 IP 访问端口

只允许 `192.168.1.100` 访问 `80/tcp`：

```bash
firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='192.168.1.100' port protocol='tcp' port='80' accept"
firewall-cmd --reload
```

### 允许一个网段访问端口

允许 `192.168.3.0/24` 网段访问 `80/tcp`：

```bash
firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='192.168.3.0/24' port protocol='tcp' port='80' accept"
firewall-cmd --reload
```

## 查看与删除 rich-rule

### 查看 rich-rule 规则

```bash
firewall-cmd --zone=public --list-rich-rules
```

### 删除指定 rich-rule

删除规则时，需要将原规则完整写入 `--remove-rich-rule`：

```bash
firewall-cmd --permanent --remove-rich-rule="rule family='ipv4' source address='192.168.1.100' port protocol='tcp' port='80' reject"
firewall-cmd --reload
```

## 常用排查命令

### 查看当前完整配置

```bash
firewall-cmd --list-all
```

### 查看所有区域配置

```bash
firewall-cmd --list-all-zones
```

### 查看端口是否开放

```bash
firewall-cmd --query-port=80/tcp
```

命令返回 `yes` 表示端口已开放，返回 `no` 表示未开放。

## 使用建议

生产环境不建议直接关闭防火墙。更推荐按服务实际需要开放端口，并通过 `rich-rule` 限制来源 IP 或网段。

如果只是临时测试端口连通性，可以先使用不带 `--permanent` 的命令；确认配置无误后，再添加永久规则并执行 `firewall-cmd --reload`。
