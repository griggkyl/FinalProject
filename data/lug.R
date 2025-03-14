getwd()
getwd()
academic_funding <- read.csv("csv/universities_funding.csv")
academic_funding_sum <- academic_funding%>%
  group_by(RECIPIENT.NAME)%>%
  summarise(award_count = n(), total_funding_awarded = sum(TOTAL.AWARD.FUNDING.AMOUNT))
View(academic_funding_sum)
write.csv(academic_funding_sum, "csv/Academic_Funding_Summary.csv")
