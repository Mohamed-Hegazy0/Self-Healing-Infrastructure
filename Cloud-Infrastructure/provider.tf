terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0" # هنا غيرنا الشرط عشان يسمح بالنسخ الحديثة اللي الموديول محتاجها
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
