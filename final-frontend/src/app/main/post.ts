import {Comment} from "./comment";

export class Post {
  public id:number;
  public body:string;
  public timeStamp:string;
  public authorUsername:string;

  public imgUrl:string;
  public comments:Comment [];

  constructor(id:number, body:string, timeStamp:string, authorUsername:string, imgUrl:string, comments:Comment []) {
    this.id = id;
    this.body = body;
    this.timeStamp = timeStamp;
    this.authorUsername = authorUsername;
    this.imgUrl = imgUrl;
    this.comments = comments;
  }

  addComment(tmpComment:Comment) {
    this.comments.push(tmpComment);
    //sort by time: big -> small
  }
}
