export class Comment {
  public id:number;
  public body:string;
  public timeStamp:string;
  public authorUsername:string;

  constructor(id:number, body:string, timeStamp:string, authorUsername:string) {
    this.id = id;
    this.body = body;
    this.timeStamp = timeStamp;
    this.authorUsername = authorUsername;
  }
}
