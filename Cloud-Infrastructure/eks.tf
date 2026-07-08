module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "VSCAN-cluster"
  cluster_version = "1.30" 

  # السماح بالوصول للـ Cluster من سيرفر الإدارة بتاعنا
  cluster_endpoint_public_access = true

  # ربط الـ Cluster بشبكة الـ VPC اللي كريتناها
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # إعدادات الـ Worker Nodes (السيرفرات اللي هتشيل الـ Containers)
  eks_managed_node_groups = {
    vscan_nodes = {
      desired_size = 3 # عدد السيرفرات اللي هتبدأ بيها
      min_size     = 1 # أقل عدد وقت الخمول
      max_size     = 3 # أقصى عدد وقت الضغط (Auto-scaling)

      instance_types = ["t3.micro"]
      capacity_type  = "ON_DEMAND"
    }
  }

  # إعطاء صلاحيات للـ Cluster عشان يقدر يكلم خدمات AWS التانية
  enable_cluster_creator_admin_permissions = true

  tags = {
    Environment = "Production"
    Project     = "VSCAN"
  }
}
# إضافة قاعدة تسمح لسيرفر الإدارة بالاتصال بالـ Cluster عبر بورت 443
resource "aws_security_group_rule" "allow_management_to_eks" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = module.eks.cluster_security_group_id   # جدار حماية الكلاستر
  source_security_group_id = aws_security_group.management_sg.id    # جدار حماية سيرفر الإدارة
}
