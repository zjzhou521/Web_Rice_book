import {zip} from "rxjs";
import {Post} from "../main/post";

export class User {
  public username:string;
  public password:string;
  public id:number;
  public name:string; // display name
  public email:string;
  public phone:string;
  public zipcode:string;
  public status:string;

  public isLogged:boolean;
  public following:number [];
  public imgUrl:string;

  constructor(username:string, password:string, id:number, name:string, email:string, phone:string, zipcode:string, status:string) {
    this.username = username;
    this.password = password;
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.zipcode = zipcode;
    this.status = status;
    this.isLogged = false;
    this.following = [];
    this.following[0] = (this.id - 1 + 1) % 10 + 1;
    this.following[1] = (this.id - 1 + 2) % 10 + 1;
    this.following[2] = (this.id - 1 + 3) % 10 + 1;
    this.imgUrl = "../../assets/images/profile/cat" + (Math.floor(Math.random()*3+1)).toString() + ".jpg";
    if (id > 10) { // new user only follows id=1
      this.following = [];
      this.following[0] = 1;
      this.imgUrl = "../../assets/images/profile/dog.jpg";
    }
  }

  updateInfo(isLogged:boolean, following:number [], imgUrl:string) {
    this.isLogged = isLogged;
    this.following = following;
    this.imgUrl = imgUrl;
  }

  login(): void {
    this.isLogged = true;
  }

  logout(): void {
    this.isLogged = false;
  }

  unfollow(id:number): void {
    this.following = this.following.filter(item => item != id);
  }

  // addPost(id:number, title:string, body:string, timeStamp:string, authorId:number) {
  //   let tmpPost = new Post(id, title, body, timeStamp, authorId);
  //   this.posts.push(tmpPost);
  //   this.posts.sort(function (A, B) {
  //     return A.timeStamp.localeCompare(B.timeStamp);
  //   });
  // }
}

