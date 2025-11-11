output "droplet_ip" {
  description = "Dirección IP pública del Droplet"
  value       = digitalocean_droplet.app.ipv4_address
}

output "droplet_name" {
  description = "Nombre del Droplet"
  value       = digitalocean_droplet.app.name
}

output "database_host" {
  description = "Host de la base de datos"
  value       = var.create_database ? digitalocean_database_cluster.postgres[0].host : "Using external database"
  sensitive   = true
}

output "database_port" {
  description = "Puerto de la base de datos"
  value       = var.create_database ? digitalocean_database_cluster.postgres[0].port : "N/A"
}

output "database_name" {
  description = "Nombre de la base de datos"
  value       = var.create_database ? digitalocean_database_cluster.postgres[0].database : "N/A"
}

output "database_user" {
  description = "Usuario de la base de datos"
  value       = var.create_database ? digitalocean_database_cluster.postgres[0].user : "N/A"
  sensitive   = true
}

output "database_password" {
  description = "Contraseña de la base de datos"
  value       = var.create_database ? digitalocean_database_cluster.postgres[0].password : "N/A"
  sensitive   = true
}

output "database_uri" {
  description = "URI completa de conexión a la base de datos"
  value       = var.create_database ? digitalocean_database_cluster.postgres[0].uri : var.database_url
  sensitive   = true
}

output "app_url" {
  description = "URL de la aplicación"
  value       = var.domain_name != "" ? "https://${var.subdomain == "@" ? "" : "${var.subdomain}."}${var.domain_name}" : "http://${digitalocean_droplet.app.ipv4_address}:${var.app_port}"
}

output "docker_image_url" {
  description = "URL completa de la imagen Docker en DigitalOcean Registry"
  value       = "registry.digitalocean.com/${var.docker_image}:${var.docker_tag}"
}

output "load_balancer_ip" {
  description = "IP del Load Balancer (si está habilitado)"
  value       = var.enable_load_balancer ? digitalocean_loadbalancer.app[0].ip : null
}

output "ssh_command" {
  description = "Comando SSH para conectarse al servidor"
  value       = "ssh root@${digitalocean_droplet.app.ipv4_address}"
}
