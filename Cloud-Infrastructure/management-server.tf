# 1. البحث التلقائي عن أحدث نسخة أصلية من Ubuntu 22.04 LTS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # المعرف الرسمي لشركة Canonical المطورة لـ Ubuntu

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 2. إنشاء Security Group (جدار حماية للسيرفر)
resource "aws_security_group" "management_sg" {
  name        = "management-server-sg"
  description = "Allow SSH and Jenkins traffic"
  vpc_id      = module.vpc.vpc_id # ربط السيرفر بالشبكة اللي عملناها

  # فتح بورت 22 عشان تقدروا تدخلوا على السيرفر (SSH)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  # فتح بورت 8080 عشان واجهة Jenkins بعدين
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # السماح للسيرفر بالاتصال بالإنترنت (عشان يحمل الـ Packages)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. بناء سيرفر الـ Ubuntu
resource "aws_instance" "management_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro" # حجم ممتاز ومناسب لتشغيل أدوات الـ DevOps
  
  # وضعه في الشبكة العامة عشان نقدر نوصل له
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.management_sg.id]
  associate_public_ip_address = true

  tags = {
    Name = "V-OPS-Management-Node"
    Role = "DevOps-Server"
  }
}

# 4. طباعة الـ IP بتاع السيرفر بعد ما يتبني عشان تدخلوا عليه
output "management_server_public_ip" {
  value       = aws_instance.management_server.public_ip
  description = "The Public IP of the Ubuntu Management Server"
}
