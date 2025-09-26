---
title: 用Prometheus监控Nginx服务器
date: 2019-12-18
author: loaf
categories:
  - 技术

tags:
  - IT
  - 运维

description: 重新编译Nginx，将Nginx的nginx-module-vts模块编译进去，用Prometheus监控Nginx服务器

---

<!-- more -->

# 用Prometheus监控Nginx服务器

基本方法是，重新编译Nginx，将Nginx的nginx-module-vts模块编译进去，因为目前有现有的Nginx服务

1. 查看版本号，`nginx -V`
2. 下载相同版本的源代码  
    `mkdir toolscd toolswget http://nginx.org/download/nginx-1.14.0.tar.gztar xf nginx-1.14.0.tar.gzcd nginx-1.14.0`
3. 备份原来的nginx  
    `cp /home/xiben/nginx/sbin/nginx /home/xiben/nginx/sbin/nginx.bakcp -r /home/xiben/nginx /home/xiben/backup`
4. 克隆vts模块仓库  
    `git clone git://github.com/vozlt/nginx-module-vts.git`
5. 编译

    ```
    ./configure --prefix=/home/xiben/nginx --add-module=/home/xiben/nginx-module-vts
    make #编译
    make install #编译安装到/home/xiben/nginx/sbin,也可以手工从 /tools/nginx-1.14.0/objs目录下拷到home/xiben/nginx/sbinx下
    ```

    安装后，直接到nginx/sbin目录下，能看到nginx文件大小和时间已经变化了，说明安装成功，但是，发现新加了模块后，文件大小反而小了，看来编译的参数不对，原来已经编译进一些模块了。回到另一个镜像的系统中，用`./nginx -V`来看看原来的编译配置。

    ```
    [xiben@XibenPmiWeb01 sbin]$ ./nginx -V
    nginx version: nginx/1.14.0
    built by gcc 4.8.5 20150623 (Red Hat 4.8.5-36) (GCC)
    built with OpenSSL 1.0.2k-fips  26 Jan 2017
    TLS SNI support enabled
    configure arguments: --prefix=/home/xiben/nginx --without-http-cache --with-http_ssl_module --with-http_gzip_static_module --with-http_realip_module --add-module=/home/xiben/backup/ngx_log_if-master
    ```

    而我新编译成功的nginx文件则是：

    ```
    [xiben@TestPM01 sbin]$ ./nginx -V
    nginx version: nginx/1.14.0
    built by gcc 4.8.5 20150623 (Red Hat 4.8.5-36) (GCC)
    configure arguments: --prefix=/home/xiben/nginx --add-module=./nginx-module-vts
    ```

    从中可以看出configure参数差了一大截。再回到/tools目录下，这次将原来的参数拷上，再加上新的–add_module,只是我不知道下载下来的第三方模块源代码在编译进去后，是不是还要调用到原来目录下的一些内容，为了安全起见，我将这个模块也拷贝到/home/xiben/backup/目录下。

    ```
    cd ~/tools/nginx-1.14.0
    cp  -r ./nginx-module-vts/ ~/backup
    ./configure --prefix=/home/xiben/nginx --without-http-cache --with-http_ssl_module --with-http_gzip_static_module --with-http_realip_module --add-module=/home/xiben/backup/ngx_log_if-master --add-module=/home/xiben/backup/nginx-module-vts
    
    make
    make install
    ```

    然后再到sbin目录下，用`./nginx -V`查看信息，这次是

    ```
    [xiben@TestPM01 sbin]$ ./nginx -V
    nginx version: nginx/1.14.0
    built by gcc 4.8.5 20150623 (Red Hat 4.8.5-36) (GCC)
    built with OpenSSL 1.0.2k-fips  26 Jan 2017
    TLS SNI support enabled
    configure arguments: --prefix=/home/xiben/nginx --without-http-cache --with-http_ssl_module --with-http_gzip_static_module --with-http_realip_module --add-module=/home/xiben/backup/ngx_log_if-master --add-module=/home/xiben/backup/nginx-module-vts
    ```

6. 在nginx.conf文件中增加配置

    先在http区内，增加一行vhost_traffic_status_zone;然后再在server区内增加一个虚拟目录。如下示例：

    ```
    http {
        vhost_traffic_status_zone;
        server {
                listen       80;
                server_name  localhost;
                location /status {
                             vhost_traffic_status_display;
                             vhost_traffic_status_display_format html;
                            }
                }
        }
    ```

7. 重启nginx  
    先用-t参数，测试一下新编译的应用是否正常

    ```
    [xiben@TestPM01 sbin]$ ./nginx -t
    nginx: the configuration file /home/xiben/nginx/conf/nginx.conf syntax is ok
    nginx: configuration file /home/xiben/nginx/conf/nginx.conf test is successful
    ```

    看到OK和Successful，可以放心了，重启一下nginx  
    `[xiben@TestPM01 sbin]$ ./nginx -s reload`  
    在本机上访问一下  
    `curl http://localhost:8088/status/format/json`  
    却显示不出正常的数据，想了一下想，可能上面reload的问题，reload没有读conf文件。

    ```
    [xiben@TestPM01 sbin]$ ./nginx -s quit
    [xiben@TestPM01 sbin]$ ./nginx
    [xiben@TestPM01 sbin]$ curl http://localhost:8088/status/format/json
    {"hostName":"testpm01","nginxVersion":"1.14.0","loadMsec":1576569291883,"nowMsec":1576569307361,"connections":{"active":4,"reading":0,"writing":1,"waiting":3,"accepted":6,"handled":6,"requests":7},....
    ```

    这下正常了。

8. 安装 nginx-vts-exporter  
    访问[nginx-vts-exporter的Github网址](https://github.com/hnlq715/nginx-vts-exporter/releases)，查看当前版本，因为我们的操作系统是CentOS，所以复制下面的链接在服务器上下载  
    `wget https://github.com/hnlq715/nginx-vts-exporter/releases/download/v0.10.3/nginx-vts-exporter-0.10.3.linux-amd64.tar.gz`  
    解压后可直接运行  
    `./nginx-vts-exporter -nginx.scrape_uri=http://localhost:8088/status/format/json`  
    这时能看到下面的信息

    ```
    2019/12/17 16:15:59 Starting nginx_vts_exporter (version=0.10.3, branch=HEAD, revision=8aa2881c7050d9b28f2312d7ce99d93458611d04)
    2019/12/17 16:15:59 Build context (go=go1.10, user=root@56ca8763ee48, date=20180328-05:47:47)
    2019/12/17 16:15:59 Starting Server at : :9913
    2019/12/17 16:15:59 Metrics endpoint: /metrics
    2019/12/17 16:15:59 Metrics namespace: nginx
    2019/12/17 16:15:59 Scraping information from : http://localhost:8088/status/format/json
    2019/12/17 16:16:03 json.Unmarshal failed invalid character '\x1f' in string literal
    ```

    这时在本地用 http://ip:9913/ 能访问页面，但访问metrics页面时出现错误提示，应该就是json解析失败。 
    停用exporter，直接用 http://ip:8088/status 访问，也能看到页面，但是没有内容，看来不是exporter的问题，而是nginx-module-vts的问题，它产生的XML文件中有非法字符。

    回到conf文件中，  
    在http段，加上`charset utf-8`  
    在http段`vhost_traffic_status_zone;`一行下加上`vhost_traffic_status_filter_by_host on;`这是[打开vhost过滤](https://blog.51cto.com/xujpxm/2080146)：开启此功能，Nginx配置有多个server_name的情况下，会根据不同的server_name进行流量的统计，否则默认会把流量全部计算到第一个server_name上。

    再试一下重启nginx，但是仍然有相同的问题。

    仔细分析，问题应该出在nginx-module-vts产生json文件时，产生serverZones区时，服务器名取nginx.conf的server_name上，因为它总是会在服务器名前加上一个“NO”和一个不可见的字符，`NOtestvhost`就是这个字符引起解析失败。而这个空白，16进制就是1f。

    我试着删除server_name这行，但是也没有用。

    想一想，这个肯定是在产生Json文件时，拼接字符产生的。只能回到源代码里看看，下载到源代码到本地，好在这个模块代码量不大，先是搜索“NO”，结果在搜索到的文件里，下几行就是很明显的内容：在ngx_http_vhost_traffic_status_module.h文件里

    ```
    #define NGX_HTTP_VHOST_TRAFFIC_STATUS_UPSTREAMS            (u_char *) "NO\0UA\0UG\0CC\0FG\0"
    
    #define NGX_HTTP_VHOST_TRAFFIC_STATUS_NODE_NONE            0
    #define NGX_HTTP_VHOST_TRAFFIC_STATUS_NODE_FIND            1
    
    #define NGX_HTTP_VHOST_TRAFFIC_STATUS_KEY_SEPARATOR        (u_char) 0x1f
    ```

    从字面也能看出，它的分隔符用的就是这个0x1f。  
    先用UltraEdit,随便输入一个点，用16进制查看一下，显示2e，到服务器上，将上面的0x1f修改成0x2e，重新编译一下。

    ```
    cd
    cd backup/nginx-module-vts/src
    vi ngx_http_vhost_traffic_status_module.h
    ```

    找到上面的地方，将0x1f修改成0x2e

    ```
    cd ~/tools/nginx-1.14.0
    ./configure --prefix=/home/xiben/nginx --without-http-cache --with-http_ssl_module --with-http_gzip_static_module --with-http_realip_module --add-module=/home/xiben/backup/ngx_log_if-master --add-module=/home/xiben/backup/nginx-module-vts
    make
    cd objs
    ll #查看一下，编译成功了
    make install
    
    cd ~/nginx/sbin
    ./nginx -s quit
    ./nginx
    ```

    再用http://IP:8088/status访问，能正常显示页面了。

    再回到上面继续exporter的安装，运行  
    `./nginx-vts-exporter -nginx.scrape_uri=http://localhost:8088/status/format/json`  
    再用http://IP:9913，进入页面后再点metrics也正常显示了。  
    退出，重新输入一下，这次输入到后台运行  
    `nohup ./nginx-vts-exporter -nginx.scrape_uri=http://localhost:8088/status/format/json &`

9. 配置prometheus  
    进入prometheus服务器,再进入prometheus目录，`vi prometheus.yml`，用最简单的配置，就是加一个job:

    ```
    - job_name: 'Nginx_TestPM01'
        static_configs:
        - targets: [x.x.x.x:9913]
    ```

    然后重启一下

    ```
    ps -ef| grep 'prometheus'
    kill 12234
    
    nohup ./prometheus &
    ```

    重刷页面<http://IP:9090/targets,显示是Down的，原因是“context> deadline exceeded”，想起来是因为Nginx服务器上ECS安全组的问题，加上Prometheus服务器就好。

10. 配置Grafana

    先去下载一个显示模板，这样就不需要自己一点一点地配了。[Nginx VTS Stats](https://grafana.com/grafana/dashboards/2949),就是下来一个Json文件。  
    然后打开Grafana网站，找到Import dashboard页面，上传刚才下载的json文件，简单选择一下，就能使用显示板了。
