cd ../admin
call npm i 
call npm run build
cd ../site
call npm i
call npm run build
cd ../server
docker-compose build
docker-compose up -d
