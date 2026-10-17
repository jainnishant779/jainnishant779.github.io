import type { Experience } from './types';

export const experiences: Experience[] = [
  {
    role: 'AI/ML & IoT Engineer',
    company: 'Synquic Labs Pvt. Ltd.',
    location: 'Indore',
    period: 'Aug 2026–Present',
    bullets: [
      'Develop AI/ML models, computer vision, and edge AI applications for product use cases.',
      'Build IoT solutions with microcontrollers and embedded devices, integrating hardware with cloud and backend systems.',
    ],
  },
  {
    role: 'Founding Engineer – AI & Software',
    company: 'Cognicity Pvt. Ltd.',
    location: 'Indore',
    period: 'Sep 2025–Aug 2026',
    bullets: [
      'Worked directly with clients to scope AI/CV solutions, then owned the full build: data pipeline, model training, REST API integration, and AWS cloud deployment.',
      'Designed and implemented YOLO-based detection systems, benchmarking results against client KPIs (mAP, precision, recall) to validate performance before release.',
      'Managed deployment infrastructure — Systemd services, Nginx reverse proxy, SSH-based access — for cloud and edge systems running in production.',
    ],
  },
  {
    role: 'Machine Learning & Computer Vision Intern',
    company: 'Cognicity Pvt. Ltd.',
    location: 'Indore',
    period: 'Aug 2025–Sep 2025',
    bullets: [
      'Fine-tuned YOLO and TensorFlow models using data augmentation and hyperparameter tuning; deployed ML inference pipelines on NVIDIA Jetson Nano for the team\'s first edge-AI client delivery.',
    ],
  },
];
