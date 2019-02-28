# middleware


## Dev
```
$ cd functions/
functions$ node local.js
```

## Deploy
```
$ firebase deploy --only functions
```




## HTTPS Load test
```
$ ab -n 10000 -c 100 https://asia-northeast1-sunvibecity.cloudfunctions.net/helloWorld

Server Software:        Google
Server Hostname:        asia-northeast1-sunvibecity.cloudfunctions.net
Server Port:            443
SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES128-GCM-SHA256,2048,128

Document Path:          /helloWorld
Document Length:        20 bytes

Concurrency Level:      100
Time taken for tests:   23.402 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      3680044 bytes
HTML transferred:       200000 bytes
Requests per second:    427.32 [#/sec] (mean)
Time per request:       234.016 [ms] (mean)
Time per request:       2.340 [ms] (mean, across all concurrent requests)
Transfer rate:          153.57 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:       92   99  18.7     97     400
Processing:    79  132 171.9     83    2999
Waiting:       79  132 171.8     83    2998
Total:        173  231 176.7    180    3094

Percentage of the requests served within a certain time (ms)
  50%    180
  66%    182
  75%    188
  80%    215
  90%    298
  95%    461
  98%    897
  99%   1132
 100%   3094 (longest request)
```

## JSON POST Load test

```
$ ab -p ./ab-post.json -T application/json -n 10000 -c 100 https://sunvibecity.firebaseio.com/queue.json

Server Software:        nginx
Server Hostname:        sunvibecity.firebaseio.com
Server Port:            443
SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES128-GCM-SHA256,2048,128

Document Path:          /queue.json
Document Length:        31 bytes

Concurrency Level:      100
Time taken for tests:   74.294 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      3180000 bytes
Total body sent:        3570000
HTML transferred:       310000 bytes
Requests per second:    134.60 [#/sec] (mean)
Time per request:       742.938 [ms] (mean)
Time per request:       7.429 [ms] (mean, across all concurrent requests)
Transfer rate:          41.80 [Kbytes/sec] received
                        46.93 kb/s sent
                        88.73 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:      349  482  13.1    483     521
Processing:   236  257  39.6    246     823
Waiting:      236  256  39.6    245     823
Total:        586  739  42.0    729    1310

Percentage of the requests served within a certain time (ms)
  50%    729
  66%    737
  75%    744
  80%    748
  90%    764
  95%    779
  98%    834
  99%    891
 100%   1310 (longest request)


```