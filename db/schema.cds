namespace intern.portal;

entity Interns {
  key ID       : UUID;
  fullName     : String;
  email        : String;
  department   : String;
  joinDate     : Date;
}

entity Tasks {
  key ID       : UUID;
  activity     : String;
  category     : String;
  priority     : String;
  status       : String;
  date         : Date;
  time         : Integer;
  intern_ID    : UUID;
}

entity CompanyPolicy {
  key ID           : UUID;
  title            : String;
  content          : LargeString;
  version          : String;
  effectiveFrom    : Date;
}

entity ChatHistory {
  key ID       : UUID;
  userMessage  : String;
  botReply     : String;
  timestamp    : Timestamp;
}
