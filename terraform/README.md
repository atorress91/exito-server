# Despliegue con Terraform en DigitalOcean

Esta configuración de Terraform despliega automáticamente la aplicación Exitojuntos en DigitalOcean usando Docker.

## 📋 Prerequisitos

1. **Cuenta de DigitalOcean**: [Registrarse aquí](https://www.digitalocean.com/)
2. **Terraform instalado**: [Descargar Terraform](https://www.terraform.io/downloads)
3. **Docker**: Para construir la imagen localmente
4. **SSH Key**: Para acceso al servidor

## 🚀 Infraestructura Creada

- **Droplet**: Servidor virtual con Docker pre-instalado
- **PostgreSQL Database**: Base de datos administrada
- **Firewall**: Reglas de seguridad configuradas
- **Load Balancer** (opcional): Para alta disponibilidad
- **DNS** (opcional): Configuración de dominio

## 📦 Pasos de Despliegue

### 1. Construir y publicar la imagen Docker

```bash
# Opción A: Usar Docker Hub
docker build -t tuusuario/exitojuntos-server:latest .
docker push tuusuario/exitojuntos-server:latest

# Opción B: Usar DigitalOcean Container Registry
doctl registry create exitojuntos
doctl registry login
docker build -t registry.digitalocean.com/exitojuntos/exitojuntos-server:latest .
docker push registry.digitalocean.com/exitojuntos/exitojuntos-server:latest
```

### 2. Configurar variables de Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edita `terraform.tfvars` con tus valores:

```hcl
do_token       = "tu-token-de-digitalocean"
ssh_public_key = "tu-clave-ssh-publica"
jwt_secret     = "tu-jwt-secret-seguro"
docker_image   = "tuusuario/exitojuntos-server"
```

### 3. Inicializar Terraform

```bash
terraform init
```

### 4. Revisar el plan de despliegue

```bash
terraform plan
```

### 5. Aplicar la configuración

```bash
terraform apply
```

Confirma con `yes` cuando se te solicite.

### 6. Obtener información del despliegue

```bash
terraform output
```

Esto mostrará:

- IP del servidor
- URL de la aplicación
- Comando SSH para conectarse
- Credenciales de base de datos (usar con `-json` para verlas)

## 🔑 Obtener Token de DigitalOcean

1. Ir a [https://cloud.digitalocean.com/account/api/tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Clic en "Generate New Token"
3. Nombre: `terraform-exitojuntos`
4. Seleccionar: Read y Write
5. Copiar el token (solo se muestra una vez)

## 🔐 Generar SSH Key (si no tienes una)

```bash
# En Linux/Mac/Windows (PowerShell)
ssh-keygen -t rsa -b 4096 -C "tu@email.com"

# Ver la clave pública
cat ~/.ssh/id_rsa.pub
```

## 📊 Variables Configurables

| Variable               | Descripción                  | Default          |
| ---------------------- | ---------------------------- | ---------------- |
| `do_token`             | Token de API de DigitalOcean | _requerido_      |
| `ssh_public_key`       | Clave SSH pública            | _requerido_      |
| `jwt_secret`           | Secret para JWT              | _requerido_      |
| `project_name`         | Nombre del proyecto          | `exitojuntos`    |
| `region`               | Región de DigitalOcean       | `nyc3`           |
| `droplet_size`         | Tamaño del servidor          | `s-1vcpu-1gb`    |
| `database_size`        | Tamaño de la BD              | `db-s-1vcpu-1gb` |
| `enable_load_balancer` | Habilitar LB                 | `false`          |
| `domain_name`          | Dominio personalizado        | `""`             |

## 🌍 Regiones Disponibles

- `nyc1`, `nyc3` - Nueva York
- `sfo3` - San Francisco
- `ams3` - Ámsterdam
- `sgp1` - Singapur
- `lon1` - Londres
- `fra1` - Frankfurt
- `tor1` - Toronto
- `blr1` - Bangalore
- `syd1` - Sydney

## 💰 Costos Estimados (USD/mes)

| Recurso       | Tamaño         | Costo |
| ------------- | -------------- | ----- |
| Droplet       | s-1vcpu-1gb    | $6    |
| Droplet       | s-1vcpu-2gb    | $12   |
| Database      | db-s-1vcpu-1gb | $15   |
| Load Balancer | -              | $12   |

## 🔧 Comandos Útiles

### Ver outputs (con valores sensibles)

```bash
terraform output -json
```

### Conectarse al servidor

```bash
ssh root@$(terraform output -raw droplet_ip)
```

### Ver logs de la aplicación

```bash
ssh root@$(terraform output -raw droplet_ip) "docker logs -f exitojuntos-app"
```

### Actualizar la aplicación

```bash
# 1. Construir nueva imagen
docker build -t tuusuario/exitojuntos-server:latest .
docker push tuusuario/exitojuntos-server:latest

# 2. SSH al servidor
ssh root@$(terraform output -raw droplet_ip)

# 3. En el servidor
docker pull tuusuario/exitojuntos-server:latest
docker stop exitojuntos-app
docker rm exitojuntos-app
docker run -d --name exitojuntos-app --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="..." \
  tuusuario/exitojuntos-server:latest
```

### Destruir la infraestructura

```bash
terraform destroy
```

⚠️ **ADVERTENCIA**: Esto eliminará todos los recursos y datos.

## 🔒 Seguridad

### Mejores prácticas:

1. **Restringir acceso SSH**: Cambiar `allowed_ssh_ips` a tu IP pública
2. **Usar secrets seguros**: Generar JWT secret fuerte
3. **Habilitar HTTPS**: Usar Load Balancer con certificado SSL
4. **Backups**: Habilitar backups automáticos de la base de datos
5. **Variables sensibles**: Nunca commitear `terraform.tfvars`

### Configurar HTTPS con Let's Encrypt (opcional)

```bash
ssh root@$(terraform output -raw droplet_ip)

# Instalar certbot
apt update
apt install -y certbot

# Obtener certificado
certbot certonly --standalone -d tudominio.com
```

## 📝 Troubleshooting

### La aplicación no inicia

```bash
# Ver logs del contenedor
ssh root@IP_DEL_SERVIDOR "docker logs exitojuntos-app"
```

### No se puede conectar a la base de datos

```bash
# Verificar DATABASE_URL
terraform output -json | grep database_uri
```

### Firewall bloqueando conexiones

```bash
# Verificar reglas del firewall
doctl compute firewall list
```

## 📚 Recursos Adicionales

- [Documentación de Terraform para DigitalOcean](https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisar logs: `docker logs exitojuntos-app`
2. Verificar variables: `terraform output`
3. Consultar documentación de DigitalOcean
