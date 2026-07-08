module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0" 

  name = "ecommerce-main-vpc"
  cidr = "10.0.0.0/16"

  # هنوزع الشبكة على مبنيين داتا سنتر مختلفين لضمان عدم وقوع السيستم
  azs             = ["us-east-1a", "us-east-1b"]
  
  # شبكات خاصة (مقفولة للـ داتا بيز والـ Backend)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  
  # شبكات عامة (مفتوحة للإنترنت عشان الـ Load Balancer)
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  # السماح للسيرفرات الخاصة إنها تخرج للإنترنت تحمل تحديثات بأمان
  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = "Production"
    Project     = "Graduation-Ecommerce"
  }
}
