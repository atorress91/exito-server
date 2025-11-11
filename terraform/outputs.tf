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
  value       = digitalocean_database_cluster.postgres.host
  sensitive   = true
}

output "database_port" {
  description = "Puerto de la base de datos"
  value       = digitalocean_database_cluster.postgres.port
}

output "database_name" {
  description = "Nombre de la base de datos"
  value       = digitalocean_database_cluster.postgres.database
}

output "database_user" {
  description = "Usuario de la base de datos"
  value       = digitalocean_database_cluster.postgres.user
  sensitive   = true
}

output "database_password" {
  description = "Contraseña de la base de datos"
  value       = digitalocean_database_cluster.postgres.password
  sensitive   = true
}

output "database_uri" {
  description = "URI completa de conexión a la base de datos"
  value       = digitalocean_database_cluster.postgres.uri
  sensitive   = true
}

output "app_url" {
  description = "URL de la aplicación"
  value       = var.domain_name != "" ? "https://${var.subdomain == "@" ? "" : "${var.subdomain}."}${var.domain_name}" : "http://${digitalocean_droplet.app.ipv4_address}:${var.app_port}"
}

output "load_balancer_ip" {
  description = "IP del Load Balancer (si está habilitado)"
  value       = var.enable_load_balancer ? digitalocean_loadbalancer.app[0].ip : null
}

output "ssh_command" {
  description = "Comando SSH para conectarse al servidor"
  value       = "ssh root@${digitalocean_droplet.app.ipv4_address}"
}
