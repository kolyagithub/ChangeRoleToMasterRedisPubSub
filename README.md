# ChangeRoleToMasterWithRedisPubSub
Application works with a wide Redis.
     - App as master(server): generate message and send only someone client (worker)
     - App as worker(client): handling message (One client can handling one message)

     - At the same time it can be run any number of applications (clients). And only one Master(server)

     - Exchange of information between any applications to carry through Redis.

     - All running copies of the application in addition to the generator are the messages and handlers
       constantly trying to get the message out Redis.

     - When killed master(server) app, someone worker(client) starting as master(client) role and send generated message to another clients

     - All clients and server can worked in different PC

     - If the current application generator is forced to conclude (deletion handler
       complete the application), one of the applications is to replace a finished (fallen) and
       become a generator.

     - Not used the tools of the OS

Usage:
    - change Redis IP ADDRESS in config file
    - 'node app show' (show incoming messages from master)
    - 'node app getErrors' (show all errors in all apps)
    - 'node app million' (handling 1000000 messages)