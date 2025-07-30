using { intern.portal as my } from '../db/schema';

service OnboardingService {
  entity Interns as projection on my.Interns;
  entity Tasks as projection on my.Tasks;
  entity CompanyPolicy as projection on my.CompanyPolicy;
  entity ChatHistory as projection on my.ChatHistory;
}
