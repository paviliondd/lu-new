export interface Author {
  name: string;
  role: string;
  avatar: string;
  description: string;
  linkedin: string;
  github: string;
}

export interface Series {
  slug: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  icon: string;
  partsCount: number;
  tag: string;
  color: string;
}

export type PostStatus = "draft" | "published";

export interface SeoMetadata {
  title: string;
  description: string;
  ogImage: string | null;
}

export interface InternalLinkingMetadata {
  hubSlug: string;
  relatedServiceSlugs: string[];
  examDomainSlugs: string[];
}

export interface Post {
  id: number;
  roadmapId: number;
  roadmapOrder: number;
  slug: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  content: string;
  content_en: string;
  category: string;
  tags: string[];
  author: string;
  status: PostStatus;
  publishDate: string | null;
  publish_date: string | null;
  date: string;
  readTime: string;
  readTime_en: string;
  views: number;
  seriesSlug: string | null;
  topicSlug: string;
  clusterSlug: string;
  gradient: string;
  certs: string[];
  services: string[];
  examDomains: string[];
  coverage: string;
  labs: string[];
  costNote: string;
  cleanupNote: string;
  editorialNote: string;
  quiz: string;
  seo: SeoMetadata;
  internalLinking: InternalLinkingMetadata;
}

export const team: Record<string, Author> = {
  nhatnghia: {
    name: "Huỳnh Lê Nhật Nghĩa (admin)",
    role: "Founder - Cloud DevOps Lead",
    avatar: "A",
    description: "Một kỹ sư Cloud & DevOps đầy tò mò, đam mê khám phá, thử nghiệm và xây dựng hạ tầng tự động hóa quy mô lớn.",
    linkedin: "https://linkedin.com",
    github: "https://github"
  },
  vanthao: {
    name: "Trần Văn Thảo",
    role: "Cloud DevOps Engineer",
    avatar: "T",
    description: "Kỹ sư chuyên trách tự động hóa hạ tầng (IaC) và xây dựng hệ thống CI/CD thông suốt.",
    linkedin: "https://linkedin.com",
    github: "https://github"
  },
  ngovi: {
    name: "Ngô Tường Vy",
    role: "Security Engineer",
    avatar: "V",
    description: "Chuyên gia bảo mật tập trung vào kiểm thử xâm nhập (Pentest) và tăng cường bảo mật cho các ứng dụng Cloud Native.",
    linkedin: "https://linkedin.com",
    github: "https://github"
  },
  hathu: {
    name: "Hà Thu",
    role: "Content Creator",
    avatar: "H",
    description: "Người kết nối kỹ thuật và cộng đồng, chịu trách nhiệm truyền tải các bài học phức tạp thành các bài viết dễ tiếp cận.",
    linkedin: "https://linkedin.com",
    github: "https://github"
  }
};

export const series: Series[] = [
  {
    "slug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "title": "Chuỗi 1: Compute & Container Infrastructure (Hạ tầng & Đóng gói Workloads)",
    "title_en": "Chuỗi 1: Compute & Container Infrastructure (Hạ tầng & Đóng gói Workloads)",
    "description": "Topic cluster from AWS roadmap: Compute & Container Infrastructure (Hạ tầng & Đóng gói Workloads).",
    "description_en": "AWS roadmap topic cluster: Compute & Container Infrastructure (Hạ tầng & Đóng gói Workloads).",
    "icon": "layers",
    "partsCount": 5,
    "tag": "Compute",
    "color": "#334155"
  },
  {
    "slug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "title": "Chuỗi 2: Serverless Datastores & Developer Workloads (Cơ sở dữ liệu & Caching)",
    "title_en": "Chuỗi 2: Serverless Datastores & Developer Workloads (Cơ sở dữ liệu & Caching)",
    "description": "Topic cluster from AWS roadmap: Serverless Datastores & Developer Workloads (Cơ sở dữ liệu & Caching).",
    "description_en": "AWS roadmap topic cluster: Serverless Datastores & Developer Workloads (Cơ sở dữ liệu & Caching).",
    "icon": "layers",
    "partsCount": 5,
    "tag": "Datastores",
    "color": "#2563eb"
  },
  {
    "slug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "title": "Chuỗi 3: Serverless Core, SDK Coding & Integration (Lập trình & Tách rời Kiến trúc)",
    "title_en": "Chuỗi 3: Serverless Core, SDK Coding & Integration (Lập trình & Tách rời Kiến trúc)",
    "description": "Topic cluster from AWS roadmap: Serverless Core, SDK Coding & Integration (Lập trình & Tách rời Kiến trúc).",
    "description_en": "AWS roadmap topic cluster: Serverless Core, SDK Coding & Integration (Lập trình & Tách rời Kiến trúc).",
    "icon": "zap",
    "partsCount": 6,
    "tag": "Serverless",
    "color": "#0284c7"
  },
  {
    "slug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
    "title": "Chuỗi 4: CI/CD, SDLC Automation & GitOps (Tự động hóa Kiểm thử & Triển khai)",
    "title_en": "Chuỗi 4: CI/CD, SDLC Automation & GitOps (Tự động hóa Kiểm thử & Triển khai)",
    "description": "Topic cluster from AWS roadmap: CI/CD, SDLC Automation & GitOps (Tự động hóa Kiểm thử & Triển khai).",
    "description_en": "AWS roadmap topic cluster: CI/CD, SDLC Automation & GitOps (Tự động hóa Kiểm thử & Triển khai).",
    "icon": "git-pull-request",
    "partsCount": 2,
    "tag": "DevOps/CICD",
    "color": "#059669"
  },
  {
    "slug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
    "title": "Chuỗi 5: Infrastructure as Code (IaC) & Configuration Management Quy mô lớn",
    "title_en": "Chuỗi 5: Infrastructure as Code (IaC) & Configuration Management Quy mô lớn",
    "description": "Topic cluster from AWS roadmap: Infrastructure as Code (IaC) & Configuration Management Quy mô lớn.",
    "description_en": "AWS roadmap topic cluster: Infrastructure as Code (IaC) & Configuration Management Quy mô lớn.",
    "icon": "layers",
    "partsCount": 2,
    "tag": "IaC/Config",
    "color": "#d97706"
  },
  {
    "slug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
    "title": "Chuỗi 6: SecOps, Monitoring, Centralized Logging & Disaster Recovery (Bảo mật & Giám sát)",
    "title_en": "Chuỗi 6: SecOps, Monitoring, Centralized Logging & Disaster Recovery (Bảo mật & Giám sát)",
    "description": "Topic cluster from AWS roadmap: SecOps, Monitoring, Centralized Logging & Disaster Recovery (Bảo mật & Giám sát).",
    "description_en": "AWS roadmap topic cluster: SecOps, Monitoring, Centralized Logging & Disaster Recovery (Bảo mật & Giám sát).",
    "icon": "layers",
    "partsCount": 2,
    "tag": "SecOps",
    "color": "#dc2626"
  }
];

export const allPosts: Post[] = [
  {
    "id": 1,
    "roadmapId": 1,
    "roadmapOrder": 1,
    "slug": "thiet-ke-vpc-enterprise-bastion-host-ssm-session-manager-va-vpc-endpoints",
    "title": "Thiết kế VPC Enterprise: Bastion Host, SSM Session Manager và VPC Endpoints",
    "title_en": "Thiết kế VPC Enterprise: Bastion Host, SSM Session Manager và VPC Endpoints",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Compute",
    "tags": [
      "AWS",
      "Compute",
      "DVA-C02",
      "DOP-C02",
      "VPC",
      "SSM",
      "DVA D2",
      "DOP D6",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "gradient": "from-slate-600/90 to-cyan-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "VPC",
      "SSM"
    ],
    "examDomains": [
      "DVA D2",
      "DOP D6"
    ],
    "coverage": "Strong",
    "labs": [
      "Xây dựng VPC cô lập không dùng Internet cho Private Subnet.",
      "Cấu hình Interface và Gateway Endpoints sang S3, DynamoDB."
    ],
    "costNote": "NAT Gateway tính phí theo giờ.",
    "cleanupNote": "Xóa NAT Gateway và release Elastic IP.",
    "editorialNote": "Bẫy phòng thi: So sánh Security Group (Stateful) và NACL (Stateless).",
    "quiz": "Q: Gateway Endpoint hỗ trợ dịch vụ nào? A: S3 và DynamoDB.",
    "seo": {
      "title": "Thiết kế VPC Enterprise: Bastion Host, SSM Session Manager và VPC Endpoints",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
      "relatedServiceSlugs": [
        "vpc",
        "ssm"
      ],
      "examDomainSlugs": [
        "dva-d2",
        "dop-d6"
      ]
    }
  },
  {
    "id": 2,
    "roadmapId": 2,
    "roadmapOrder": 2,
    "slug": "dao-sau-van-hanh-ec2-user-data-vs-metadata-launch-templates-va-auto-scaling-nang-cao",
    "title": "Đào sâu Vận hành EC2: User Data vs Metadata, Launch Templates và Auto Scaling nâng cao",
    "title_en": "Đào sâu Vận hành EC2: User Data vs Metadata, Launch Templates và Auto Scaling nâng cao",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Compute",
    "tags": [
      "AWS",
      "Compute",
      "DVA-C02",
      "DOP-C02",
      "EC2",
      "ASG",
      "DVA D1",
      "DOP D3",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "gradient": "from-slate-600/90 to-cyan-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "EC2",
      "ASG"
    ],
    "examDomains": [
      "DVA D1",
      "DOP D3"
    ],
    "coverage": "Strong",
    "labs": [
      "Viết Script User Data gọi IMDSv2 qua Token để lấy Metadata.",
      "Cấu hình Step Scaling dựa trên SQS queue depth."
    ],
    "costNote": "Tính phí theo giờ chạy EC2.",
    "cleanupNote": "Terminate instance và xóa Auto Scaling Group.",
    "editorialNote": "Trọng tâm: Bắt buộc dùng IMDSv2 bảo mật cao thay cho IMDSv1.",
    "quiz": "Q: IMDSv2 dùng phương thức gì để tăng tính bảo mật? A: Session-oriented Token.",
    "seo": {
      "title": "Đào sâu Vận hành EC2: User Data vs Metadata, Launch Templates và Auto Scaling nâng cao",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
      "relatedServiceSlugs": [
        "ec2",
        "asg"
      ],
      "examDomainSlugs": [
        "dva-d1",
        "dop-d3"
      ]
    }
  },
  {
    "id": 3,
    "roadmapId": 3,
    "roadmapOrder": 3,
    "slug": "lam-chu-elastic-beanstalk-phan-biet-5-chien-luoc-deployment-quan-tri-cau-hinh",
    "title": "Làm chủ Elastic Beanstalk: Phân biệt 5 Chiến lược Deployment & Quản trị Cấu hình",
    "title_en": "Làm chủ Elastic Beanstalk: Phân biệt 5 Chiến lược Deployment & Quản trị Cấu hình",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Compute",
    "tags": [
      "AWS",
      "Compute",
      "DVA-C02",
      "DOP-C02",
      "Beanstalk",
      "DVA D3",
      "DOP D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "gradient": "from-slate-600/90 to-cyan-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "Beanstalk"
    ],
    "examDomains": [
      "DVA D3",
      "DOP D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Deploy Web App lên Beanstalk.",
      "Thực nghiệm: Rolling, Immutable và Traffic Splitting."
    ],
    "costNote": "Miễn phí dịch vụ Beanstalk, chỉ tính phí EC2/ALB đi kèm.",
    "cleanupNote": "Chọn Terminate Environment trên Console.",
    "editorialNote": "Trọng tâm: Phân biệt Downtime và tốc độ Rollback của từng chiến lược.",
    "quiz": "Q: Chiến lược nào an toàn nhất, rollback nhanh nhất? A: Immutable.",
    "seo": {
      "title": "Làm chủ Elastic Beanstalk: Phân biệt 5 Chiến lược Deployment & Quản trị Cấu hình",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
      "relatedServiceSlugs": [
        "beanstalk"
      ],
      "examDomainSlugs": [
        "dva-d3",
        "dop-d1"
      ]
    }
  },
  {
    "id": 4,
    "roadmapId": 4,
    "roadmapOrder": 4,
    "slug": "quan-tri-ecs-fargate-phan-biet-task-role-vs-execution-role-co-che-co-gian",
    "title": "Quản trị ECS Fargate: Phân biệt Task Role vs Execution Role & Cơ chế Co giãn",
    "title_en": "Quản trị ECS Fargate: Phân biệt Task Role vs Execution Role & Cơ chế Co giãn",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Compute",
    "tags": [
      "AWS",
      "Compute",
      "DVA-C02",
      "DOP-C02",
      "ECS",
      "Fargate",
      "DVA D1",
      "DOP D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "gradient": "from-slate-600/90 to-cyan-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "ECS",
      "Fargate"
    ],
    "examDomains": [
      "DVA D1",
      "DOP D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Đóng gói Docker app đẩy lên ECR.",
      "Khởi chạy Task Serverless trên ECS Fargate.",
      "Cấu hình Task Role độc lập."
    ],
    "costNote": "Tính phí theo tài nguyên vCPU/Memory tiêu thụ.",
    "cleanupNote": "Xóa ECS Service, Cluster và ECR Repository.",
    "editorialNote": "Bẫy phòng thi: Execution Role dùng để kéo ảnh/đẩy log, Task Role là quyền của app.",
    "quiz": "Q: App muốn đọc dữ liệu từ DynamoDB thì cấp quyền vào role nào? A: Task Role.",
    "seo": {
      "title": "Quản trị ECS Fargate: Phân biệt Task Role vs Execution Role & Cơ chế Co giãn",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
      "relatedServiceSlugs": [
        "ecs",
        "fargate"
      ],
      "examDomainSlugs": [
        "dva-d1",
        "dop-d1"
      ]
    }
  },
  {
    "id": 42,
    "roadmapId": 42,
    "roadmapOrder": 5,
    "slug": "container-delivery-toan-dien-tren-ecs-eks-app-runner-va-aws-copilot",
    "title": "Container Delivery Toàn diện trên ECS, EKS, App Runner và AWS Copilot",
    "title_en": "Container Delivery Toàn diện trên ECS, EKS, App Runner và AWS Copilot",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Compute",
    "tags": [
      "AWS",
      "Compute",
      "DOP-C02",
      "EKS",
      "AppRunner",
      "DOP D1",
      "Coverage Missing"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
    "gradient": "from-slate-600/90 to-cyan-700/90",
    "certs": [
      "DOP-C02"
    ],
    "services": [
      "EKS",
      "AppRunner"
    ],
    "examDomains": [
      "DOP D1"
    ],
    "coverage": "Missing",
    "labs": [
      "Deploy container lên AWS App Runner đối chiếu hạ tầng.",
      "Khởi tạo cụm EKS, thiết lập ALB Ingress Controller."
    ],
    "costNote": "EKS cụm tính phí cố định $0.10/giờ.",
    "cleanupNote": "Xóa cụm EKS và App Runner Service.",
    "editorialNote": "Trọng tâm: So sánh ECS Auto Scaling với EKS Karpenter/HPA.",
    "quiz": "Q: Khi nào dùng App Runner? A: Khi cần chạy Web App đơn giản mà không muốn quản lý cluster.",
    "seo": {
      "title": "Container Delivery Toàn diện trên ECS, EKS, App Runner và AWS Copilot",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "compute-container-infrastructure-ha-tang-dong-goi-workloads",
      "relatedServiceSlugs": [
        "eks",
        "apprunner"
      ],
      "examDomainSlugs": [
        "dop-d1"
      ]
    }
  },
  {
    "id": 5,
    "roadmapId": 5,
    "roadmapOrder": 6,
    "slug": "quan-tri-luu-tru-amazon-s3-lifecycle-policies-replication-performance-optimization",
    "title": "Quản trị Lưu trữ Amazon S3: Lifecycle Policies, Replication & Performance Optimization",
    "title_en": "Quản trị Lưu trữ Amazon S3: Lifecycle Policies, Replication & Performance Optimization",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Datastores",
    "tags": [
      "AWS",
      "Datastores",
      "DVA-C02",
      "DOP-C02",
      "S3",
      "DVA D1",
      "DOP D3",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "gradient": "from-blue-600/90 to-emerald-600/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "S3"
    ],
    "examDomains": [
      "DVA D1",
      "DOP D3"
    ],
    "coverage": "Strong",
    "labs": [
      "Cấu hình Lifecycle rules chuyển dữ liệu tự động sang Glacier.",
      "Thiết lập Cross-Region Replication chéo tài khoản."
    ],
    "costNote": "Phí lưu trữ S3 rất thấp.",
    "cleanupNote": "Empty Bucket và Delete Bucket.",
    "editorialNote": "Bẫy phòng thi: S3 Object Lock (Governance vs Compliance mode).",
    "quiz": "Q: Tối ưu hiệu năng S3 bằng cách nào? A: Sử dụng Hash prefix (>3550 PUT/s).",
    "seo": {
      "title": "Quản trị Lưu trữ Amazon S3: Lifecycle Policies, Replication & Performance Optimization",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
      "relatedServiceSlugs": [
        "s3"
      ],
      "examDomainSlugs": [
        "dva-d1",
        "dop-d3"
      ]
    }
  },
  {
    "id": 6,
    "roadmapId": 6,
    "roadmapOrder": 7,
    "slug": "kien-truc-nosql-voi-dynamodb-phan-1-thiet-ke-indexes-lsi-vs-gsi-va-sua-loi-throttling",
    "title": "Kiến trúc NoSQL với DynamoDB (Phần 1): Thiết kế Indexes LSI vs GSI và Sửa lỗi Throttling",
    "title_en": "Kiến trúc NoSQL với DynamoDB (Phần 1): Thiết kế Indexes LSI vs GSI và Sửa lỗi Throttling",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Datastores",
    "tags": [
      "AWS",
      "Datastores",
      "DVA-C02",
      "DOP-C02",
      "DynamoDB",
      "DVA D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "gradient": "from-blue-600/90 to-emerald-600/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "DynamoDB"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Thiết kế bảng DynamoDB dùng Partition Key + Sort Key.",
      "Tạo LSI và GSI để tối ưu hóa bài toán truy vấn."
    ],
    "costNote": "Tính phí theo RCU/WCU hoặc On-demand.",
    "cleanupNote": "Xóa bảng DynamoDB.",
    "editorialNote": "Bẫy phòng thi: LSI tạo lúc khởi tạo bảng, GSI có thể tạo bất kỳ lúc nào.",
    "quiz": "Q: Lỗi nghẽn GSI có ảnh hưởng bảng chính không? A: Có, block ghi bảng chính chéo.",
    "seo": {
      "title": "Kiến trúc NoSQL với DynamoDB (Phần 1): Thiết kế Indexes LSI vs GSI và Sửa lỗi Throttling",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
      "relatedServiceSlugs": [
        "dynamodb"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 7,
    "roadmapId": 7,
    "roadmapOrder": 8,
    "slug": "lap-trinh-ung-dung-voi-dynamodb-phan-2-conditional-writes-transactions-streams",
    "title": "Lập trình ứng dụng với DynamoDB (Phần 2): Conditional Writes, Transactions & Streams",
    "title_en": "Lập trình ứng dụng với DynamoDB (Phần 2): Conditional Writes, Transactions & Streams",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Datastores",
    "tags": [
      "AWS",
      "Datastores",
      "DVA-C02",
      "DynamoDB",
      "Lambda",
      "DVA D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "gradient": "from-blue-600/90 to-emerald-600/90",
    "certs": [
      "DVA-C02"
    ],
    "services": [
      "DynamoDB",
      "Lambda"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Viết code Conditional Writes chống ghi trùng.",
      "Bật DynamoDB Streams trigger Lambda xử lý bất đồng bộ."
    ],
    "costNote": "Tính theo số request API.",
    "cleanupNote": "Xóa Event Source Mapping.",
    "editorialNote": "Trọng tâm: Hiểu sâu TransactWriteItems/TransactGetItems bảo đảm tính ACID.",
    "quiz": "Q: Dịch vụ nào xử lý giao dịch All-or-Nothing trên DynamoDB? A: DynamoDB Transactions.",
    "seo": {
      "title": "Lập trình ứng dụng với DynamoDB (Phần 2): Conditional Writes, Transactions & Streams",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
      "relatedServiceSlugs": [
        "dynamodb",
        "lambda"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 8,
    "roadmapId": 8,
    "roadmapOrder": 9,
    "slug": "toi-uu-hieu-nang-voi-elasticache-lua-chon-redis-vs-memcached-chien-luoc-cache",
    "title": "Tối ưu Hiệu năng với ElastiCache: Lựa chọn Redis vs Memcached & Chiến lược Cache",
    "title_en": "Tối ưu Hiệu năng với ElastiCache: Lựa chọn Redis vs Memcached & Chiến lược Cache",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Datastores",
    "tags": [
      "AWS",
      "Datastores",
      "DVA-C02",
      "ElastiCache",
      "DVA D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "gradient": "from-blue-600/90 to-emerald-600/90",
    "certs": [
      "DVA-C02"
    ],
    "services": [
      "ElastiCache"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Dựng cụm ElastiCache Redis.",
      "Viết code tích hợp Cache-Aside và Write-Through kèm TTL."
    ],
    "costNote": "Tính phí theo giờ chạy của node instance.",
    "cleanupNote": "Xóa cụm ElastiCache.",
    "editorialNote": "Bẫy phòng thi: Chọn Memcached cho đa luồng đơn giản; chọn Redis cho Multi-AZ sẵn sàng cao.",
    "quiz": "Q: Động cơ nào hỗ trợ backup/restore và tự động Failover? A: Redis.",
    "seo": {
      "title": "Tối ưu Hiệu năng với ElastiCache: Lựa chọn Redis vs Memcached & Chiến lược Cache",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
      "relatedServiceSlugs": [
        "elasticache"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 36,
    "roadmapId": 36,
    "roadmapOrder": 10,
    "slug": "rds-aurora-cho-developer-connection-pooling-voi-rds-proxy-va-secrets-rotation",
    "title": "RDS/Aurora cho Developer: Connection Pooling với RDS Proxy và Secrets Rotation",
    "title_en": "RDS/Aurora cho Developer: Connection Pooling với RDS Proxy và Secrets Rotation",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Datastores",
    "tags": [
      "AWS",
      "Datastores",
      "DVA-C02",
      "RDS",
      "RDS Proxy",
      "DVA D1",
      "Coverage Missing"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
    "gradient": "from-blue-600/90 to-emerald-600/90",
    "certs": [
      "DVA-C02"
    ],
    "services": [
      "RDS",
      "RDS Proxy"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Missing",
    "labs": [
      "Cấu hình Lambda kết nối RDS Proxy vào Aurora DB.",
      "Giả lập lỗi 'Too many connections' kiểm thử hiệu năng."
    ],
    "costNote": "RDS Proxy tính phí theo vCPU.",
    "cleanupNote": "Xóa Proxy và Database Instance.",
    "editorialNote": "Trọng tâm: Sử dụng IAM Database Authentication loại bỏ mật khẩu tĩnh.",
    "quiz": "Q: Vì sao nên đặt RDS Proxy trước Lambda? A: Tiết kiệm connection pool khi Lambda scale nhanh.",
    "seo": {
      "title": "RDS/Aurora cho Developer: Connection Pooling với RDS Proxy và Secrets Rotation",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-datastores-developer-workloads-co-so-du-lieu-caching",
      "relatedServiceSlugs": [
        "rds",
        "rds-proxy"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 9,
    "roadmapId": 9,
    "roadmapOrder": 11,
    "slug": "lam-chu-aws-lambda-execution-context-layers-va-xu-ly-loi-qua-dlq-destinations",
    "title": "Làm chủ AWS Lambda: Execution Context, Layers và Xử lý Lỗi qua DLQ/Destinations",
    "title_en": "Làm chủ AWS Lambda: Execution Context, Layers và Xử lý Lỗi qua DLQ/Destinations",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Serverless",
    "tags": [
      "AWS",
      "Serverless",
      "DVA-C02",
      "DOP-C02",
      "Lambda",
      "DVA D1",
      "DOP D3",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "gradient": "from-sky-600/90 to-violet-600/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "Lambda"
    ],
    "examDomains": [
      "DVA D1",
      "DOP D3"
    ],
    "coverage": "Strong",
    "labs": [
      "Tái sử dụng DB Connection ngoài handler.",
      "Đóng gói thư viện nặng vào Lambda Layers."
    ],
    "costNote": "1 triệu request đầu tiên miễn phí.",
    "cleanupNote": "Xóa các hàm Lambda test.",
    "editorialNote": "Phân biệt: Gọi đồng bộ (Client retry) và gọi bất đồng bộ (Lambda tự động retry 2 lần).",
    "quiz": "Q: SQS trigger Lambda là đồng bộ hay bất đồng bộ? A: Đồng bộ (Lambda service đi poll).",
    "seo": {
      "title": "Làm chủ AWS Lambda: Execution Context, Layers và Xử lý Lỗi qua DLQ/Destinations",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
      "relatedServiceSlugs": [
        "lambda"
      ],
      "examDomainSlugs": [
        "dva-d1",
        "dop-d3"
      ]
    }
  },
  {
    "id": 10,
    "roadmapId": 10,
    "roadmapOrder": 12,
    "slug": "xay-dung-gateway-doanh-nghiep-voi-api-gateway-throttling-canary-lambda-authorizer",
    "title": "Xây dựng Gateway Doanh nghiệp với API Gateway: Throttling, Canary & Lambda Authorizer",
    "title_en": "Xây dựng Gateway Doanh nghiệp với API Gateway: Throttling, Canary & Lambda Authorizer",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Serverless",
    "tags": [
      "AWS",
      "Serverless",
      "DVA-C02",
      "APIGateway",
      "DVA D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "gradient": "from-sky-600/90 to-violet-600/90",
    "certs": [
      "DVA-C02"
    ],
    "services": [
      "APIGateway"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Tạo REST API, cấu hình Throttling và Stage Canary.",
      "Viết Custom Lambda Authorizer giải mã JWT."
    ],
    "costNote": "Tính phí trên số lượng triệu request nhận được.",
    "cleanupNote": "Xóa REST API trên Console.",
    "editorialNote": "Trọng tâm: Phân biệt mã lỗi HTTP 429 từ API Gateway vs Lambda Concurrency.",
    "quiz": "Q: Chặn request xấu tại cửa ngõ mà không cần chạy backend bằng cách nào? A: Lambda Authorizer + Token Caching.",
    "seo": {
      "title": "Xây dựng Gateway Doanh nghiệp với API Gateway: Throttling, Canary & Lambda Authorizer",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
      "relatedServiceSlugs": [
        "apigateway"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 11,
    "roadmapId": 11,
    "roadmapOrder": 13,
    "slug": "tach-roi-kien-truc-he-thong-phan-biet-sqs-standard-vs-fifo-va-sns-fan-out-pattern",
    "title": "Tách rời Kiến trúc Hệ thống: Phân biệt SQS (Standard vs FIFO) và SNS Fan-out Pattern",
    "title_en": "Tách rời Kiến trúc Hệ thống: Phân biệt SQS (Standard vs FIFO) và SNS Fan-out Pattern",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Serverless",
    "tags": [
      "AWS",
      "Serverless",
      "DVA-C02",
      "DOP-C02",
      "SQS",
      "SNS",
      "DVA D1",
      "DOP D3",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "gradient": "from-sky-600/90 to-violet-600/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "SQS",
      "SNS"
    ],
    "examDomains": [
      "DVA D1",
      "DOP D3"
    ],
    "coverage": "Strong",
    "labs": [
      "Tạo SQS FIFO bảo đảm MessageDeduplicationId.",
      "Cấu hình SNS Topic đẩy song song dữ liệu về nhiều SQS."
    ],
    "costNote": "Rất rẻ, tính theo triệu message.",
    "cleanupNote": "Xóa SQS Queues và SNS Topics.",
    "editorialNote": "Trọng tâm: Cấu hình Visibility Timeout chuẩn xác để tránh worker xử lý trùng lặp.",
    "quiz": "Q: Làm sao bảo đảm tin nhắn chạy đúng thứ tự và không trùng? A: SQS FIFO.",
    "seo": {
      "title": "Tách rời Kiến trúc Hệ thống: Phân biệt SQS (Standard vs FIFO) và SNS Fan-out Pattern",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
      "relatedServiceSlugs": [
        "sqs",
        "sns"
      ],
      "examDomainSlugs": [
        "dva-d1",
        "dop-d3"
      ]
    }
  },
  {
    "id": 12,
    "roadmapId": 12,
    "roadmapOrder": 14,
    "slug": "xu-ly-luong-su-kien-eventbridge-pipes-scheduler-vs-amazon-kinesis-ecosystem",
    "title": "Xử lý Luồng Sự kiện: EventBridge (Pipes/Scheduler) vs Amazon Kinesis Ecosystem",
    "title_en": "Xử lý Luồng Sự kiện: EventBridge (Pipes/Scheduler) vs Amazon Kinesis Ecosystem",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Serverless",
    "tags": [
      "AWS",
      "Serverless",
      "DVA-C02",
      "DOP-C02",
      "EventBridge",
      "Kinesis",
      "DVA D1",
      "DOP D4",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "gradient": "from-sky-600/90 to-violet-600/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "EventBridge",
      "Kinesis"
    ],
    "examDomains": [
      "DVA D1",
      "DOP D4"
    ],
    "coverage": "Strong",
    "labs": [
      "Dùng EventBridge Scheduler tạo Cron-job chạy theo múi giờ.",
      "Cấu hình Kinesis Data Streams nâng Shard nóng."
    ],
    "costNote": "Kinesis tính phí theo Shard-hour.",
    "cleanupNote": "Xóa stream và rules.",
    "editorialNote": "Sửa lỗi ProvisionedThroughputExceededException bằng cách tăng Shard hoặc tối ưu Partition Key.",
    "quiz": "Q: Stream log dung lượng cực lớn về S3 dùng gì không cần viết code? A: Kinesis Data Firehose.",
    "seo": {
      "title": "Xử lý Luồng Sự kiện: EventBridge (Pipes/Scheduler) vs Amazon Kinesis Ecosystem",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
      "relatedServiceSlugs": [
        "eventbridge",
        "kinesis"
      ],
      "examDomainSlugs": [
        "dva-d1",
        "dop-d4"
      ]
    }
  },
  {
    "id": 13,
    "roadmapId": 13,
    "roadmapOrder": 15,
    "slug": "dieu-phoi-quy-trinh-nghiep-vu-phuc-tap-voi-step-functions-va-aws-appsync-graphql",
    "title": "Điều phối Quy trình Nghiệp vụ Phức tạp với Step Functions và AWS AppSync (GraphQL)",
    "title_en": "Điều phối Quy trình Nghiệp vụ Phức tạp với Step Functions và AWS AppSync (GraphQL)",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Serverless",
    "tags": [
      "AWS",
      "Serverless",
      "DVA-C02",
      "DOP-C02",
      "StepFunctions",
      "AppSync",
      "DVA D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "gradient": "from-sky-600/90 to-violet-600/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "StepFunctions",
      "AppSync"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Thiết kế State Machine chạy quy trình duyệt đơn hàng đa bước.",
      "Cấu hình Exponential Backoff."
    ],
    "costNote": "Tính theo số lượng dịch chuyển trạng thái (State transitions).",
    "cleanupNote": "Xóa State Machine.",
    "editorialNote": "Chọn Step Functions khi quy trình kéo dài (lên tới 1 năm với Standard workflow).",
    "quiz": "Q: Thời gian chạy tối đa của Standard Workflow? A: 1 năm.",
    "seo": {
      "title": "Điều phối Quy trình Nghiệp vụ Phức tạp với Step Functions và AWS AppSync (GraphQL)",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
      "relatedServiceSlugs": [
        "stepfunctions",
        "appsync"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 32,
    "roadmapId": 32,
    "roadmapOrder": 16,
    "slug": "aws-sdk-cli-credential-provider-chain-pagination-va-idempotency-thuc-chien",
    "title": "AWS SDK, CLI, Credential Provider Chain, Pagination và Idempotency thực chiến",
    "title_en": "AWS SDK, CLI, Credential Provider Chain, Pagination và Idempotency thực chiến",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "Serverless",
    "tags": [
      "AWS",
      "Serverless",
      "DVA-C02",
      "SDK",
      "CLI",
      "DVA D1",
      "Coverage Missing"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
    "gradient": "from-sky-600/90 to-violet-600/90",
    "certs": [
      "DVA-C02"
    ],
    "services": [
      "SDK",
      "CLI"
    ],
    "examDomains": [
      "DVA D1"
    ],
    "coverage": "Missing",
    "labs": [
      "Viết mã nguồn Python/Node.js ghi dữ liệu hàng loạt dùng Paginator.",
      "Cấu hình Client-side Retries."
    ],
    "costNote": "Miễn phí tài nguyên client.",
    "cleanupNote": "Xóa code local.",
    "editorialNote": "Thứ tự Chain: Biến môi trường -> ~/.aws -> IAM Role trên EC2/Task ECS.",
    "quiz": "Q: Để tránh ghi trùng bản ghi khi client gửi lại request lỗi, dùng gì? A: ClientRequestToken (Idempotency).",
    "seo": {
      "title": "AWS SDK, CLI, Credential Provider Chain, Pagination và Idempotency thực chiến",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "serverless-core-sdk-coding-integration-lap-trinh-tach-roi-kien-truc",
      "relatedServiceSlugs": [
        "sdk",
        "cli"
      ],
      "examDomainSlugs": [
        "dva-d1"
      ]
    }
  },
  {
    "id": 14,
    "roadmapId": 14,
    "roadmapOrder": 17,
    "slug": "xay-dung-pipeline-ci-cd-doanh-nghiep-codepipeline-codecommit-codebuild-codedeploy",
    "title": "Xây dựng Pipeline CI/CD Doanh nghiệp: CodePipeline, CodeCommit, CodeBuild & CodeDeploy",
    "title_en": "Xây dựng Pipeline CI/CD Doanh nghiệp: CodePipeline, CodeCommit, CodeBuild & CodeDeploy",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "DevOps/CICD",
    "tags": [
      "AWS",
      "DevOps/CICD",
      "DVA-C02",
      "DOP-C02",
      "CodePipeline",
      "CodeBuild",
      "CodeDeploy",
      "DVA D3",
      "DOP D1",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
    "gradient": "from-emerald-600/90 to-teal-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "CodePipeline",
      "CodeBuild",
      "CodeDeploy"
    ],
    "examDomains": [
      "DVA D3",
      "DOP D1"
    ],
    "coverage": "Strong",
    "labs": [
      "Thiết kế file buildspec.yml đóng gói app.",
      "Thiết kế appspec.yml thực thi hooks điều phối traffic."
    ],
    "costNote": "CodeBuild tính theo phút chạy.",
    "cleanupNote": "Xóa Pipeline và các S3 Artifact Buckets.",
    "editorialNote": "Bẫy phòng thi: Hiểu sâu thứ tự chạy Lifecycle Hooks của CodeDeploy (BeforeAllowTraffic, AfterAllowTraffic).",
    "quiz": "Q: File cấu hình các bước build của CodeBuild tên là gì? A: buildspec.yml.",
    "seo": {
      "title": "Xây dựng Pipeline CI/CD Doanh nghiệp: CodePipeline, CodeCommit, CodeBuild & CodeDeploy",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
      "relatedServiceSlugs": [
        "codepipeline",
        "codebuild",
        "codedeploy"
      ],
      "examDomainSlugs": [
        "dva-d3",
        "dop-d1"
      ]
    }
  },
  {
    "id": 44,
    "roadmapId": 44,
    "roadmapOrder": 18,
    "slug": "kien-truc-ci-cd-multi-account-enterprise-cross-account-codepipeline-ket-hop-kms-quan-ly-tap-trung",
    "title": "Kiến trúc CI/CD Multi-Account Enterprise: Cross-Account CodePipeline kết hợp KMS quản lý tập trung",
    "title_en": "Kiến trúc CI/CD Multi-Account Enterprise: Cross-Account CodePipeline kết hợp KMS quản lý tập trung",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "DevOps/CICD",
    "tags": [
      "AWS",
      "DevOps/CICD",
      "DOP-C02",
      "CodePipeline",
      "KMS",
      "DOP D1",
      "Coverage Missing"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
    "gradient": "from-emerald-600/90 to-teal-700/90",
    "certs": [
      "DOP-C02"
    ],
    "services": [
      "CodePipeline",
      "KMS"
    ],
    "examDomains": [
      "DOP D1"
    ],
    "coverage": "Missing",
    "labs": [
      "Dựng Pipeline ở Account A kéo code, build artifact và deploy sang EC2/S3 thuộc Account B.",
      "Cấu hình KMS Key Policy chéo tài khoản."
    ],
    "costNote": "Tốn phí dịch vụ KMS và S3 Data Transfer.",
    "cleanupNote": "Xóa Pipeline, xóa KMS key và S3 bucket.",
    "editorialNote": "Trọng tâm DOP chuyên sâu: S3 Bucket Owner Enforced và quy trình assume cross-account IAM Roles.",
    "quiz": "Q: Pipeline cross-account bắt buộc dùng loại mã hóa S3 nào? A: KMS Customer Managed Key (CMK), không dùng SSE-S3 mặc định.",
    "seo": {
      "title": "Kiến trúc CI/CD Multi-Account Enterprise: Cross-Account CodePipeline kết hợp KMS quản lý tập trung",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "ci-cd-sdlc-automation-gitops-tu-dong-hoa-kiem-thu-trien-khai",
      "relatedServiceSlugs": [
        "codepipeline",
        "kms"
      ],
      "examDomainSlugs": [
        "dop-d1"
      ]
    }
  },
  {
    "id": 15,
    "roadmapId": 15,
    "roadmapOrder": 19,
    "slug": "lam-chu-aws-cloudformation-toi-uu-nested-stacks-stack-policies-xu-ly-drift-detection",
    "title": "Làm chủ AWS CloudFormation: Tối ưu Nested Stacks, Stack Policies & Xử lý Drift Detection",
    "title_en": "Làm chủ AWS CloudFormation: Tối ưu Nested Stacks, Stack Policies & Xử lý Drift Detection",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "IaC/Config",
    "tags": [
      "AWS",
      "IaC/Config",
      "DVA-C02",
      "DOP-C02",
      "CloudFormation",
      "DVA D3",
      "DOP D2",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
    "gradient": "from-amber-600/90 to-slate-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "CloudFormation"
    ],
    "examDomains": [
      "DVA D3",
      "DOP D2"
    ],
    "coverage": "Strong",
    "labs": [
      "Viết template CloudFormation dựng mạng.",
      "Sử dụng Nested Stacks module hóa.",
      "Bật Drift để quét lỗi sửa tay hạ tầng."
    ],
    "costNote": "Miễn phí tính năng CloudFormation cơ bản.",
    "cleanupNote": "Xóa CloudFormation Stack chính.",
    "editorialNote": "Trọng tâm: Sử dụng Stack Policies ngăn chặn vô tình xóa nhầm database production.",
    "quiz": "Q: Lệnh nào cập nhật stack an toàn giúp preview tài nguyên thay đổi? A: CloudFormation Change Sets.",
    "seo": {
      "title": "Làm chủ AWS CloudFormation: Tối ưu Nested Stacks, Stack Policies & Xử lý Drift Detection",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
      "relatedServiceSlugs": [
        "cloudformation"
      ],
      "examDomainSlugs": [
        "dva-d3",
        "dop-d2"
      ]
    }
  },
  {
    "id": 43,
    "roadmapId": 43,
    "roadmapOrder": 20,
    "slug": "cloudformation-stacksets-toan-dien-tu-dong-hoa-landing-zone-multi-account-integration-voi-aws-organizations",
    "title": "CloudFormation StackSets toàn diện: Tự động hóa Landing Zone Multi-Account & Integration với AWS Organizations",
    "title_en": "CloudFormation StackSets toàn diện: Tự động hóa Landing Zone Multi-Account & Integration với AWS Organizations",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "IaC/Config",
    "tags": [
      "AWS",
      "IaC/Config",
      "DOP-C02",
      "CloudFormation",
      "Organizations",
      "DOP D2",
      "Coverage Missing"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
    "gradient": "from-amber-600/90 to-slate-700/90",
    "certs": [
      "DOP-C02"
    ],
    "services": [
      "CloudFormation",
      "Organizations"
    ],
    "examDomains": [
      "DOP D2"
    ],
    "coverage": "Missing",
    "labs": [
      "Dùng StackSets deploy tự động tài nguyên IAM/Security Hub từ Management Account xuống các OU mới lập."
    ],
    "costNote": "Tính phí tài nguyên do stack tạo ra.",
    "cleanupNote": "Xóa StackSet Instances trước khi xóa StackSet.",
    "editorialNote": "Trọng tâm DOP: Cơ chế tự động thêm/xóa tài nguyên khi account join/leave OU (Auto-deployment).",
    "quiz": "Q: Làm sao deploy stack song song sang 50 accounts nhanh nhất? A: Cấu hình MaxConcurrentCount và FailureTolerance trong StackSets.",
    "seo": {
      "title": "CloudFormation StackSets toàn diện: Tự động hóa Landing Zone Multi-Account & Integration với AWS Organizations",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "infrastructure-as-code-iac-configuration-management-quy-mo-lon",
      "relatedServiceSlugs": [
        "cloudformation",
        "organizations"
      ],
      "examDomainSlugs": [
        "dop-d2"
      ]
    }
  },
  {
    "id": 16,
    "roadmapId": 16,
    "roadmapOrder": 21,
    "slug": "bao-mat-nang-cao-voi-aws-iam-policy-evaluation-logic-permission-boundaries-khoa-kms",
    "title": "Bảo mật nâng cao với AWS IAM: Policy Evaluation Logic, Permission Boundaries & Khóa KMS",
    "title_en": "Bảo mật nâng cao với AWS IAM: Policy Evaluation Logic, Permission Boundaries & Khóa KMS",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "SecOps",
    "tags": [
      "AWS",
      "SecOps",
      "DVA-C02",
      "DOP-C02",
      "IAM",
      "KMS",
      "DVA D2",
      "DOP D6",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
    "gradient": "from-rose-600/90 to-indigo-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "IAM",
      "KMS"
    ],
    "examDomains": [
      "DVA D2",
      "DOP D6"
    ],
    "coverage": "Strong",
    "labs": [
      "Cấu hình Permission Boundary giới hạn quyền cho admin cấp dưới.",
      "Mã hóa KMS Envelope Encryption."
    ],
    "costNote": "IAM miễn phí, KMS tính phí $1/key/tháng.",
    "cleanupNote": "Xóa Key KMS (lên lịch xóa) và IAM Policies.",
    "editorialNote": "Bẫy phòng thi: Thứ tự đánh giá Policy: Explicit Deny -> Explicit Allow -> Mặc định Deny.",
    "quiz": "Q: Đâu là rào cản tối đa ngăn chặn nâng cấp đặc quyền? A: Permission Boundary.",
    "seo": {
      "title": "Bảo mật nâng cao với AWS IAM: Policy Evaluation Logic, Permission Boundaries & Khóa KMS",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
      "relatedServiceSlugs": [
        "iam",
        "kms"
      ],
      "examDomainSlugs": [
        "dva-d2",
        "dop-d6"
      ]
    }
  },
  {
    "id": 17,
    "roadmapId": 17,
    "roadmapOrder": 22,
    "slug": "giam-sat-dien-rong-cloudwatch-logs-metric-filters-x-ray-subsegments-opentelemetry-adot",
    "title": "Giám sát diện rộng: CloudWatch Logs, Metric Filters, X-Ray Subsegments & OpenTelemetry (ADOT)",
    "title_en": "Giám sát diện rộng: CloudWatch Logs, Metric Filters, X-Ray Subsegments & OpenTelemetry (ADOT)",
    "description": "",
    "description_en": "",
    "content": "",
    "content_en": "",
    "category": "SecOps",
    "tags": [
      "AWS",
      "SecOps",
      "DVA-C02",
      "DOP-C02",
      "CloudWatch",
      "XRay",
      "DVA D4",
      "DOP D4",
      "Coverage Strong"
    ],
    "author": "nhatnghia",
    "status": "draft",
    "publishDate": null,
    "publish_date": null,
    "date": "",
    "readTime": "Draft",
    "readTime_en": "Draft",
    "views": 0,
    "seriesSlug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
    "topicSlug": "aws-epic-roadmap-dva-c02-devops-professional",
    "clusterSlug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
    "gradient": "from-rose-600/90 to-indigo-700/90",
    "certs": [
      "DVA-C02",
      "DOP-C02"
    ],
    "services": [
      "CloudWatch",
      "XRay"
    ],
    "examDomains": [
      "DVA D4",
      "DOP D4"
    ],
    "coverage": "Strong",
    "labs": [
      "Cấu hình CloudWatch Agent đẩy log OS.",
      "Cài X-Ray Daemon lên ứng dụng, nhúng subsegments theo dõi truy vấn."
    ],
    "costNote": "Tính phí dung lượng log nạp vào.",
    "cleanupNote": "Xóa log group và tắt X-Ray daemon.",
    "editorialNote": "Nắm chắc cách cấu hình sampling rate để tiết kiệm chi phí giám sát.",
    "quiz": "Q: Để theo dõi phân tán microservices xuyên suốt từ client tới DB dùng gì? A: AWS X-Ray.",
    "seo": {
      "title": "Giám sát diện rộng: CloudWatch Logs, Metric Filters, X-Ray Subsegments & OpenTelemetry (ADOT)",
      "description": "",
      "ogImage": null
    },
    "internalLinking": {
      "hubSlug": "secops-monitoring-centralized-logging-disaster-recovery-bao-mat-giam-sat",
      "relatedServiceSlugs": [
        "cloudwatch",
        "xray"
      ],
      "examDomainSlugs": [
        "dva-d4",
        "dop-d4"
      ]
    }
  }
];

export const draftPosts: Post[] = allPosts.filter((post) => post.status === "draft");

export const publishedPosts: Post[] = allPosts.filter(
  (post) => post.status === "published" && post.publishDate !== null
);

// Public frontend compatibility: only published posts are visible on the site.
export const posts: Post[] = publishedPosts;

export const categories: string[] = [
  "Compute",
  "Datastores",
  "DevOps/CICD",
  "IaC/Config",
  "SecOps",
  "Serverless"
];

export const tags: string[] = [
  "APIGateway",
  "ASG",
  "AWS",
  "AppRunner",
  "AppSync",
  "Beanstalk",
  "CLI",
  "CloudFormation",
  "CloudWatch",
  "CodeBuild",
  "CodeDeploy",
  "CodePipeline",
  "Compute",
  "Coverage Missing",
  "Coverage Strong",
  "DOP D1",
  "DOP D2",
  "DOP D3",
  "DOP D4",
  "DOP D6",
  "DOP-C02",
  "DVA D1",
  "DVA D2",
  "DVA D3",
  "DVA D4",
  "DVA-C02",
  "Datastores",
  "DevOps/CICD",
  "DynamoDB",
  "EC2",
  "ECS",
  "EKS",
  "ElastiCache",
  "EventBridge",
  "Fargate",
  "IAM",
  "IaC/Config",
  "KMS",
  "Kinesis",
  "Lambda",
  "Organizations",
  "RDS",
  "RDS Proxy",
  "S3",
  "SDK",
  "SNS",
  "SQS",
  "SSM",
  "SecOps",
  "Serverless",
  "StepFunctions",
  "VPC",
  "XRay"
];

export const roadmapImportSummary = {
  sourceFile: "D:/Blog_AWS/Road-map.html",
  generatedAt: "2026-06-09T00:00:00+07:00",
  claimedArticleCount: 44,
  explicitArticleCount: allPosts.length,
  missingArticleIds: [18,19,20,21,22,23,24,25,26,27,28,29,30,31,33,34,35,37,38,39,40,41],
};
