variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "exitojuntos"
}

variable "environment" {
  description = "Ambiente de despliegue (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "region" {
  description = "Región de DigitalOcean"
  type        = string
  default     = "nyc3"
  # Opciones: nyc1, nyc3, sfo3, ams3, sgp1, lon1, fra1, tor1, blr1, syd1
}

variable "droplet_size" {
  description = "Tamaño del Droplet"
  type        = string
  default     = "s-1vcpu-1gb"
  # Opciones: s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-2vcpu-4gb, etc.
}

variable "ssh_public_key" {
  description = "Clave SSH pública para acceder al servidor"
  type        = string
}

variable "docker_image" {
  description = "Nombre de la imagen Docker"
  type        = string
  default     = "exitojuntos-server"
}

variable "docker_tag" {
  description = "Tag de la imagen Docker"
  type        = string
  default     = "latest"
}

variable "app_port" {
  description = "Puerto donde corre la aplicación"
  type        = string
  default     = "3000"
}

variable "node_env" {
  description = "Node environment"
  type        = string
  default     = "production"
}

variable "jwt_secret" {
  description = "Secret para JWT"
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "Tiempo de expiración del JWT"
  type        = string
  default     = "1d"
}

variable "postgres_version" {
  description = "Versión de PostgreSQL"
  type        = string
  default     = "16"
}

variable "database_size" {
  description = "Tamaño del cluster de base de datos"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "database_node_count" {
  description = "Número de nodos en el cluster de base de datos"
  type        = number
  default     = 1
}

variable "allowed_ssh_ips" {
  description = "IPs permitidas para conexión SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_load_balancer" {
  description = "Habilitar Load Balancer"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Nombre del dominio (dejar vacío si no se usa)"
  type        = string
  default     = ""
}

variable "subdomain" {
  description = "Subdominio (@ para el dominio raíz)"
  type        = string
  default     = "@"
}
