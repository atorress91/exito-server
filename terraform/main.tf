terraform {
  required_version = ">= 1.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# SSH Key para acceder al Droplet
resource "digitalocean_ssh_key" "default" {
  name       = "${var.project_name}-key"
  public_key = var.ssh_public_key
}

# Droplet (Servidor Virtual)
resource "digitalocean_droplet" "app" {
  image    = "docker-20-04"
  name     = "${var.project_name}-server"
  region   = var.region
  size     = var.droplet_size
  ssh_keys = [digitalocean_ssh_key.default.id]

  user_data = templatefile("${path.module}/cloud-init.yml", {
    do_token       = var.do_token
    docker_image   = var.docker_image
    docker_tag     = var.docker_tag
    app_port       = var.app_port
    db_host        = var.db_host
    db_port        = var.db_port
    db_username    = var.db_username
    db_password    = var.db_password
    db_database    = var.db_database
    jwt_secret     = var.jwt_secret
    jwt_expires_in = var.jwt_expires_in
    node_env       = var.node_env
  })

  tags = [var.environment, "version-${replace(var.deployment_version, ".", "-")}"]

  lifecycle {
    create_before_destroy = true
    replace_triggered_by = [
      null_resource.deployment_trigger
    ]
  }
}

# Resource para forzar recreación cuando cambie deployment_version
resource "null_resource" "deployment_trigger" {
  triggers = {
    deployment_version = var.deployment_version
    docker_tag         = var.docker_tag
  }
}

# Base de datos PostgreSQL administrada (OPCIONAL)
resource "digitalocean_database_cluster" "postgres" {
  count = var.create_database ? 1 : 0

  name       = "${var.project_name}-db"
  engine     = "pg"
  version    = var.postgres_version
  size       = var.database_size
  region     = var.region
  node_count = var.database_node_count

  tags = [var.environment]
}

# Firewall para el Droplet
resource "digitalocean_firewall" "app" {
  name = "${var.project_name}-firewall"

  droplet_ids = [digitalocean_droplet.app.id]

  # Permitir SSH
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = var.allowed_ssh_ips
  }

  # Permitir HTTP
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Permitir HTTPS
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Permitir puerto de la aplicación
  inbound_rule {
    protocol         = "tcp"
    port_range       = var.app_port
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Permitir todo el tráfico saliente
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# Load Balancer (opcional, para alta disponibilidad)
resource "digitalocean_loadbalancer" "app" {
  count = var.enable_load_balancer ? 1 : 0

  name   = "${var.project_name}-lb"
  region = var.region

  forwarding_rule {
    entry_port     = 80
    entry_protocol = "http"

    target_port     = var.app_port
    target_protocol = "http"
  }

  healthcheck {
    port     = var.app_port
    protocol = "http"
    path     = "/api/docs"
  }

  droplet_ids = [digitalocean_droplet.app.id]
}

# Domain (opcional)
resource "digitalocean_domain" "default" {
  count = var.domain_name != "" ? 1 : 0

  name = var.domain_name
}

# DNS Record apuntando al Droplet o Load Balancer
resource "digitalocean_record" "app" {
  count = var.domain_name != "" ? 1 : 0

  domain = digitalocean_domain.default[0].name
  type   = "A"
  name   = var.subdomain
  value  = var.enable_load_balancer ? digitalocean_loadbalancer.app[0].ip : digitalocean_droplet.app.ipv4_address
  ttl    = 300
}
