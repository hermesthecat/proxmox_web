# Proxmox_web

A frontend open-source project based on Proxmox-ve_6.2.1 backend, developed using [Vue + vuex + element + vue-router]. Includes virtual machine management, cloning, backup, replication,

as well as Lvm, Lvm-thin, ceph local storage, etc.

Thanks to the open-source community, and thanks to promox-ve for providing the backend open-source project!

If this helped you even a little bit, please give it a star 🙂

## Backend Code Deployment

Install proxmox-ve_6.2-1.iso version

## Frontend Code Deployment

    1. Download code from https://github.com/hermesthecat/proxmox_web.git

    2. Run 'npm run build' in the package.json directory

    3. After compilation, you'll get the dist directory in the public folder

    4. Install nginx: apt-get install nginx

    5. Create crt directory under /etc/nginx and execute

       Generate certificate on Linux system:

       1. Generate key, run:

       openssl genrsa -des3 -out server.key 2048

       You'll be asked to enter a password twice, enter the same one. Then you'll get a server.key file.

       2. If you want to remove the password prompt when using this file (through openssl commands or API), use the following command:

          openssl rsa -in server.key -out server.key

       3. Create server certificate request file server.csr, run:

          openssl req -new -key server.key -out server.csr

         For Country Name enter CN, Common Name can be your hostname or left blank. If left blank, browser will mark it as unsafe. (e.g., if your future URL will be https://abcd/xxxx…, you can enter abcd here). Others can be left blank.

       4. Create CA certificate:

          openssl req -new -x509 -key server.key -out ca.crt -days 3650

          Now you'll get a ca.crt certificate, which is used to sign your own certificate.

       5. Create server certificate server.crt valid for 10 years from current date:

          openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt

       6. If you ls your folder, you'll see 5 files generated:

          ca.crt   ca.srl    server.crt   server.csr   server.key
          Among these, server.crt and server.key are the certificate files needed by nginx.

    6. Place the files from the dist directory obtained in step 3 into /var/www/mhflex directory

    7. Configure nginx.conf file: Replace /etc/nginx/nginx.conf with the nginx.conf file from the package.json directory

    8. After completing above steps, execute the 'nginx' command

    Open the link https://ip:3000/login to test related functions

## Screenshots:

![Login](https://github.com/hermesthecat/proxmox_web/blob/master/public/login.png)

![Monitoring](https://github.com/hermesthecat/proxmox_web/blob/master/public/chart.png)

![Homepage](https://github.com/hermesthecat/proxmox_web/blob/master/public/home.png)

![Node](https://github.com/hermesthecat/proxmox_web/blob/master/public/node.png)
