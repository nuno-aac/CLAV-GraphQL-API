Para dar set-up ao servidor através do docker é preciso:

- Mover o ficheiro docker-compose.yml para a pasta acima da pasta "CLAV-GraphQL-API"
- Correr docker-compose up -d
- Abrir um terminal no container de node e correr os comandos:
	-cd home/povoamento
	-node arango.js