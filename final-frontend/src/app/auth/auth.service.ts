import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  curUsername: string;
  curPassword: string;
  backendUrl: string;

  constructor(private http: HttpClient) {
    this.curUsername = "";
    this.curPassword = "";
    // this.backendUrl = "http://localhost:3000/";
    this.backendUrl = "https://final-backend-jay.herokuapp.com/";
  }

  async registerUser(username:string, password:string, displayName:string, email:string, phone:string, zipcode:string, dob:number): Promise<string> {
    let result = "";
    let register = new Promise(resolve => this.http.post(this.backendUrl + "register", {
      username: username,
      password: password,
      displayName: displayName,
      phone: phone,
      email: email,
      dob: dob,
      zipcode: zipcode
    }, {withCredentials: true}).subscribe(res => {
      let r = Object.assign(res);
      result = r.result;
      resolve("done");
    }));
    await register;
    return result;
  }

  async loginUser(username:string, password:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.backendUrl + "login", {
      username: username,
      password: password
    }, {withCredentials: true}).subscribe(res => {
      let r = Object.assign(res);
      result = r.result;
      resolve("done");
    }));
    await login;
    this.curUsername = username;
    this.curPassword = password;
    return result;
  }
}
