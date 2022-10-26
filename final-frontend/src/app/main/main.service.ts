import { Injectable } from '@angular/core';
import {Post} from "./post";
import {AuthService} from "../auth/auth.service";
import {HttpClient} from "@angular/common/http";
import {User} from "../auth/user";
import {Comment} from "./comment"
import {FollowUser} from "./follow-user";
import {resolve} from "@angular/compiler-cli/src/ngtsc/file_system";

@Injectable({
  providedIn: 'root'
})
export class MainService {
  posts: Post [];
  followingUsers: FollowUser [];
  curUsername: string;
  curPassword: string;
  curUser: FollowUser;
  backendUrl: string;

  constructor(private authServ:AuthService, private http: HttpClient) {
    this.posts = [];
    this.followingUsers = [];
    this.curUsername = authServ.curUsername;
    this.curPassword = authServ.curPassword;
    this.curUser = new FollowUser(this.curUsername);
    this.backendUrl = authServ.backendUrl;
  }

  dateToTimestamp(dateNum:number) {
    let date = new Date(dateNum);
    let timeStamp = date.getFullYear() + "-" ;
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    if (month < 10) {
      timeStamp += "0" + month.toString();
    } else {
      timeStamp += month.toString();
    }
    timeStamp += "-";
    if (day < 10) {
      timeStamp += "0" + day.toString();
    } else {
      timeStamp += day.toString();
    }
    timeStamp += " ";
    if (hour < 10) {
      timeStamp += "0" + hour.toString();
    } else {
      timeStamp += hour.toString();
    }
    timeStamp += ":";
    if (minute < 10) {
      timeStamp += "0" + minute.toString();
    } else {
      timeStamp += minute.toString();
    }
    timeStamp += ":";
    if (second < 10) {
      timeStamp += "0" + second.toString();
    } else {
      timeStamp += second.toString();
    }
    return timeStamp;
  }

  sortPosts(posts:Post []): void {
    let compare = function (A: Post,B: Post) {
      let dateSumA = A.timeStamp.split(" ")[0];
      let timeSumA = A.timeStamp.split(" ")[1];
      let sumA = parseInt(dateSumA.split("-")[0]) * 10000 * 1000000;
      sumA += parseInt(dateSumA.split("-")[1]) * 100 * 1000000;
      sumA += parseInt(dateSumA.split("-")[2]) * 1000000;
      sumA += parseInt(timeSumA.split(":")[0]) * 10000;
      sumA += parseInt(timeSumA.split(":")[1]) * 100;
      sumA += parseInt(timeSumA.split(":")[2]);

      let dateSumB = B.timeStamp.split(" ")[0];
      let timeSumB = B.timeStamp.split(" ")[1];
      let sumB = parseInt(dateSumB.split("-")[0]) * 10000 * 1000000;
      sumB += parseInt(dateSumB.split("-")[1]) * 100 * 1000000;
      sumB += parseInt(dateSumB.split("-")[2]) * 1000000;
      sumB += parseInt(timeSumB.split(":")[0]) * 10000;
      sumB += parseInt(timeSumB.split(":")[1]) * 100;
      sumB += parseInt(timeSumB.split(":")[2]);
      if (sumA < sumB) return 1; //big first
      else return -1;
    }
    posts.sort(compare);
  }

  sortComments(comments:Comment []): void {
    let compare = function (A: Comment,B: Comment) {
      let dateSumA = A.timeStamp.split(" ")[0];
      let timeSumA = A.timeStamp.split(" ")[1];
      let sumA = parseInt(dateSumA.split("-")[0]) * 10000 * 1000000;
      sumA += parseInt(dateSumA.split("-")[1]) * 100 * 1000000;
      sumA += parseInt(dateSumA.split("-")[2]) * 1000000;
      sumA += parseInt(timeSumA.split(":")[0]) * 10000;
      sumA += parseInt(timeSumA.split(":")[1]) * 100;
      sumA += parseInt(timeSumA.split(":")[2]);

      let dateSumB = B.timeStamp.split(" ")[0];
      let timeSumB = B.timeStamp.split(" ")[1];
      let sumB = parseInt(dateSumB.split("-")[0]) * 10000 * 1000000;
      sumB += parseInt(dateSumB.split("-")[1]) * 100 * 1000000;
      sumB += parseInt(dateSumB.split("-")[2]) * 1000000;
      sumB += parseInt(timeSumB.split(":")[0]) * 10000;
      sumB += parseInt(timeSumB.split(":")[1]) * 100;
      sumB += parseInt(timeSumB.split(":")[2]);
      if (sumA < sumB) return 1; //big first
      else return -1;
    }
    comments.sort(compare);
  }
}
