import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {User} from "../auth/user";
import {MainService} from "./main.service";
import {AuthService} from "../auth/auth.service";
import {Post} from "./post";
import {main} from "@angular/compiler-cli/src/main";
import {Comment} from "./comment";
import {FollowUser} from "./follow-user";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  curUser: FollowUser;
  curUsername: string;
  posts: Post [];
  searchPosts: Post [];
  followingUsers: FollowUser [];
  warningMessage: string;
  file: any; // Variable to store file
  curPostImgUrl: string;
  // editWarningMessage:string;
  tmpUsername: string;

  constructor(private el:ElementRef, private mainServ: MainService, private router:Router, private authServ:AuthService, private http: HttpClient) {
    this.curUsername = authServ.curUsername;
    this.curUser = new FollowUser(this.curUsername);
    this.posts = mainServ.posts;
    this.searchPosts = [];
    this.followingUsers = mainServ.followingUsers;
    this.warningMessage = "";
    this.file = null;
    this.curPostImgUrl = "";
    // this.editWarningMessage = "";
    this.tmpUsername = "";
  }

  ngOnInit(): void {
    this.checkLogin().then(ret => {
      this.getFollowing().then(ret => {
        this.getFeed().then(ret => {
          this.getCurUser();
        })
      })
    })
  }

  // On file Select
  onChange(event:Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    if (files.length == 0) {
      this.file = null;
    } else {
      this.file = files[0];
    }
  }

  // Returns an observable
  async upload(text:string, file:File):Promise<string> {
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    const formData = new FormData();
    formData.append("text", text);
    formData.append("image", file);
    // formData.append("image", file, file.name);

    let putAvatar = new Promise(resolve => this.http.put(this.authServ.backendUrl + "articleimage/", formData, {withCredentials: true}).subscribe(res => {
      this.curPostImgUrl = Object.assign(res).imageUrl;
      resolve("done");
    }));
    await putAvatar;
    return result;


  }

  // OnClick of button Upload
  onUpload() {
    if (this.file !=null) {
      // let imageText = this.el.nativeElement.querySelector("#imageText").value;
      let imageText = "123";
      this.upload(imageText, this.file).then(res => {
        this.getFeed();
      })
    }
  }

  async checkLogin(): Promise<boolean>{
    if (this.curUsername == "") {
      this.curUsername = localStorage.getItem('aaa') as string;
      this.authServ.curPassword = localStorage.getItem('bbb') as string;
    } else {
      localStorage.setItem('aaa', this.curUsername);
      localStorage.setItem('bbb', this.authServ.curPassword);
    }
    let ret = true;
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      let result = Object.assign(res).result;
      if (result != "success") {
        // this.router.navigate(['/']);
        ret = false;
      } else {
        ret = true;
        resolve("done");
      }
    }));
    await login;
    return ret;
  }

  async getCurUser(): Promise<boolean>{
    let ret = false;
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    let addHeadline = new Promise(resolve => this.http.get(this.mainServ.backendUrl + "headline/" + this.curUsername, {withCredentials: true}).subscribe(res => {
      let headline = Object.assign(res).headline;
      this.curUser.addStatus(headline);
      resolve("done");
    }));
    await addHeadline;
    let addAvatar = new Promise(resolve => this.http.get(this.mainServ.backendUrl + "avatar/" + this.curUsername, {withCredentials: true}).subscribe(res => {
      let avatarURL = Object.assign(res).avatar;
      this.curUser.addImgUrl(avatarURL);
      resolve("done");
    }));
    await addAvatar;
    return ret;
  }

  async getFollowing(): Promise<boolean>{
    let ret = false;
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      this.followingUsers = [];
      resolve("done");
    }));
    await login;

    console.log(this.curUsername);
    console.log(this.authServ.curPassword);

    let getFollowingUsernames = new Promise(resolve => this.http.get(this.mainServ.backendUrl + "following", {withCredentials: true}).subscribe(res => {
      let followingUsernames = Object.assign(res).following;
      for (let i = 0; i < followingUsernames.length; i++) {
        let foUsername = followingUsernames[i];
        let followUser = new FollowUser(foUsername);
        let addHeadline = new Promise(resolve => this.http.get(this.mainServ.backendUrl + "headline/" + foUsername, {withCredentials: true}).subscribe(res => {
          let headline = Object.assign(res).headline;
          followUser.addStatus(headline);
          resolve("done");
        }));
        let addAvatar = new Promise(resolve => this.http.get(this.mainServ.backendUrl + "avatar/" + foUsername, {withCredentials: true}).subscribe(res => {
          let avatarURL = Object.assign(res).avatar;
          followUser.addImgUrl(avatarURL);
          resolve("done");
        }));
        this.followingUsers.push(followUser);
      }
      resolve("done");
    }));
    await getFollowingUsernames;
    return ret;
  }

  async getFeed(): Promise<boolean>{
    this.posts = [];
    let ret = false;
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    let getArticles = new Promise(resolve => this.http.get(this.mainServ.backendUrl + "articles", {withCredentials: true}).subscribe(res => {
      let r = Object.assign(res);
      let articles = r.articles;
      for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        // get comments
        let comments = [];
        for (let j = 0; j < article.comments.length; j++) {
          let dataComment = article.comments[j];
          let comment = new Comment(j, dataComment.commentText, this.mainServ.dateToTimestamp(dataComment.commentDate), dataComment.commentAuthor);
          comments.push(comment);
        }
        this.mainServ.sortComments(comments);
        let timestamp = this.mainServ.dateToTimestamp(article.date);
        let post = new Post(article.pid, article.text, timestamp, article.author, article.imgUrl, comments);
        this.posts.push(post);
      }
      this.mainServ.sortPosts(this.posts);
      ret = true;
      resolve("done");
    }));
    await getArticles;
    return ret;
  }

  async putLogout(): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    this.http.put(this.mainServ.backendUrl + "logout", {
    }, {withCredentials: true, responseType: 'text'}).subscribe(res => {
    });
    return result;
  }

  logout(): void {
    this.putLogout();
  }

  async postArticle(text:string): Promise<boolean>{
    let result = false;
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    if (this.curPostImgUrl == "") {
      let postNewArticle = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "article", {
        text: text
      }, {withCredentials: true}).subscribe(res => {
        result = true;
        resolve("done");
      }));
      await postNewArticle;
    } else {
      let postNewArticle = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "article", {
        text: text,
        imageUrl: this.curPostImgUrl
      }, {withCredentials: true}).subscribe(res => {
        result = true;
        resolve("done");
      }));
      await postNewArticle;
    }


    return result;
  }

  createNewPost(): void {
    let postText = this.el.nativeElement.querySelector("#new-post-text").value;
    this.postArticle(postText).then(ret => {
      this.curPostImgUrl = "";
      this.getFeed();
    });
    this.el.nativeElement.querySelector("#new-post-text").value = "";
    this.el.nativeElement.querySelector("#input-file").value = "";
  }

  cancelNewPost(): void {
    this.el.nativeElement.querySelector("#new-post-text").value = "";
    this.curPostImgUrl = "";
    this.el.nativeElement.querySelector("#input-file").value = "";
  }

  async updateHeadline(newHeadline:string): Promise<boolean>{
    let ret = false;
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    let putHeadline = new Promise(resolve => this.http.put(this.authServ.backendUrl + "headline", {
      headline: newHeadline
    }, {withCredentials: true}).subscribe(res => {
      ret = true;
      resolve("done");
    }));
    await putHeadline;
    return ret;
  }

  updateStatus(): void {
    let newStatus = "#new-status";
    this.updateHeadline(this.el.nativeElement.querySelector(newStatus).value).then(ret => {
      this.getCurUser();
      this.el.nativeElement.querySelector(newStatus).value = "";
    })
  }

  async deleteFollow(followUsername:string): Promise<boolean>{
    let ret = false;
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    let deleteFollowing = new Promise(resolve => this.http.delete(this.mainServ.backendUrl + "following/" + followUsername, {withCredentials: true}).subscribe(res => {
      ret = true;
      resolve("done");
    }));
    await deleteFollowing;
    return ret;
  }

  unfollow(username:string): void {
    this.deleteFollow(username).then(ret => {
      this.getFollowing().then(ret => {
        this.getFeed();
      });
    });
  }

  async putFollow(followUsername:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    let putFollowing = new Promise(resolve => this.http.put(this.mainServ.backendUrl + "following/" + followUsername, {
    }, {withCredentials: true}).subscribe(res => {
      result = Object.assign(res).result;
      if (!result) {
        result = "success";
      }
      resolve("done");
    }));
    await putFollowing;
    return result;
  }


  addWithFollowName(username:string): void {
    this.warningMessage = "";
    if (username == "") return;

    this.putFollow(username).then(result => {
      if (result == "success") {
        this.warningMessage = "";
      } else {
        this.warningMessage = result;
      }
      this.getFollowing().then(ret => {
        this.getFeed();
      })
    });
  }

  addFollow(): void {
    let username = this.el.nativeElement.querySelector("#follow-add").value;
    this.addWithFollowName(username);
    this.el.nativeElement.querySelector("#follow-add").value = "";
  }

  searchWithText(text:string): void {
    this.searchPosts = [];
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i].body.search(text)!=-1) {
        this.searchPosts.push(this.posts[i]);
      }
    }
    this.el.nativeElement.querySelector("#search-input").value = "";
  }

  searchText(): void {
    this.searchPosts = [];
    let text = this.el.nativeElement.querySelector("#search-input").value;
    if (text == "") return;
    this.searchWithText(text);
  }

  searchWithAuthor(author:string): void {
    this.searchPosts = [];
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i].authorUsername == author) {
        this.searchPosts.push(this.posts[i]);
      }
    }
    this.el.nativeElement.querySelector("#search-input").value = "";
  }

  searchAuthor(): void {
    this.searchPosts = [];
    let author = this.el.nativeElement.querySelector("#search-input").value;
    if (author == "") return;
    this.searchWithAuthor(author);
  }






  editPost(postId:number): void {
    let text = this.el.nativeElement.querySelector("#edit-text-" + postId).value;
    this.putAricle(text, postId).then(ret => {
      this.getFeed();
    });
    this.el.nativeElement.querySelector("#edit-text-" + postId).value = "";
  }

  async putAricle(text:string, postId:number): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putCom = new Promise(resolve => this.http.put(this.mainServ.backendUrl + "articles/" + postId, {
      text: text,
      commentId: ""
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putCom;
    return result;
  }

  editComment(postId:number, commentId:number): void {
    let text = this.el.nativeElement.querySelector("#edit-comment-" + postId + "-" + commentId).value;
    this.putUpdateComment(text, postId, commentId).then(ret => {
      this.getFeed();
    });
    this.el.nativeElement.querySelector("#edit-comment-" + postId + "-" + commentId).value = "";
  }

  async putUpdateComment(text:string, postId:number, commentId:number): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putCom = new Promise(resolve => this.http.put(this.mainServ.backendUrl + "articles/" + postId, {
      text: text,
      commentId: commentId.toString()
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putCom;
    return result;
  }


  addComment(postId:number): void {
    let text = this.el.nativeElement.querySelector("#edit-text-" + postId).value;
    this.putComment(text, postId).then(ret => {
      this.getFeed();
    });
    this.el.nativeElement.querySelector("#edit-text-" + postId).value = "";
  }

  async putComment(text:string, postId:number): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.mainServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.authServ.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putCom = new Promise(resolve => this.http.put(this.mainServ.backendUrl + "articles/" + postId, {
      text: text,
      commentId: "-1"
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putCom;
    return result;
  }



}
