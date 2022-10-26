import {Component, ElementRef, OnInit} from '@angular/core';
import {MainService} from "../main/main.service";
import {AuthService} from "../auth/auth.service";
import {ProfileService} from "./profile.service";
import {Router} from "@angular/router";
import {User} from "../auth/user";
import {FormControl, FormGroup} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {FileChangeEvent} from "@angular/compiler-cli/src/perform_watch";
import {Observable} from "rxjs";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  curUsername: string;
  curPassword: string;
  curAvatar: string;
  curDisplayName: string;
  curEmail: string;
  curPhone: string;
  curZipcode: string;
  updateForm: FormGroup;
  file: any; // Variable to store file


  constructor(private el:ElementRef, private mainSerc:MainService, private router:Router, private authServ:AuthService, private profServ:ProfileService, private http: HttpClient) {
    this.curUsername = authServ.curUsername;
    this.curPassword = authServ.curPassword;
    this.curAvatar = "";
    this.curDisplayName = "";
    this.curEmail = "";
    this.curPhone = "";
    this.curZipcode = "";
    this.updateForm = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
      zipcode: new FormControl(''),
      password: new FormControl(''),
      password_confirm: new FormControl('')
    });
    this.file = null;
  }

  ngOnInit(): void {
    this.checkLogin().then(ret => {
      this.getCurProfile().then(ret => {

      })
    });
  }

  ngAfterViewInit() {
    const phone = this.el.nativeElement.querySelector('#phone');
    phone.addEventListener("input",function (){
      if(phone.validity.patternMismatch)
        phone.setCustomValidity("Expect proper format of 123-123-1234");
      else
        phone.setCustomValidity("");
    });

    const zipcode = this.el.nativeElement.querySelector('#zipcode');
    zipcode.addEventListener("input",function (){
      if(zipcode.validity.patternMismatch)
        zipcode.setCustomValidity("Expect proper format of 12345");
      else
        zipcode.setCustomValidity("");
    });
  }

  async checkLogin(): Promise<boolean>{
    if (this.curUsername == "") {
      this.curUsername = localStorage.getItem('aaa') as string;
      this.curPassword = localStorage.getItem('bbb') as string;
    } else {
      localStorage.setItem('aaa', this.curUsername);
      localStorage.setItem('bbb', this.curPassword);
    }
    let ret = true;
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
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
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    const formData = new FormData();
    formData.append("text", text);
    formData.append("image", file);
    // formData.append("image", file, file.name);

    let putAvatar = new Promise(resolve => this.http.put(this.authServ.backendUrl + "avatar/", formData, {withCredentials: true}).subscribe(res => {
      let avatarUrl = Object.assign(res).avatar;
      if (avatarUrl) {
        this.curAvatar = avatarUrl;
      }
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
        this.getCurProfile();
      })
    }
  }

  async getCurProfile(): Promise<boolean>{
    let ret = false;
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    let addAvatar = new Promise(resolve => this.http.get(this.authServ.backendUrl + "avatar", {withCredentials: true}).subscribe(res => {
      this.curAvatar = Object.assign(res).avatar;
      resolve("done");
    }));
    await addAvatar;
    let addDisplayName = new Promise(resolve => this.http.get(this.authServ.backendUrl + "displayname", {withCredentials: true}).subscribe(res => {
      this.curDisplayName = Object.assign(res).displayname;
      resolve("done");
    }));
    await addDisplayName;
    let addEmail = new Promise(resolve => this.http.get(this.authServ.backendUrl + "email", {withCredentials: true}).subscribe(res => {
      this.curEmail = Object.assign(res).email;
      resolve("done");
    }));
    await addEmail;
    let addPhone = new Promise(resolve => this.http.get(this.authServ.backendUrl + "phone", {withCredentials: true}).subscribe(res => {
      this.curPhone = Object.assign(res).phone;
      resolve("done");
    }));
    await addPhone;
    let addZipcode = new Promise(resolve => this.http.get(this.authServ.backendUrl + "zipcode", {withCredentials: true}).subscribe(res => {
      this.curZipcode = Object.assign(res).zipcode;
      ret = true;
      resolve("done");
    }));
    await addZipcode;
    return ret;
  }

  async putLogout(): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;

    this.http.put(this.authServ.backendUrl + "logout", {
    }, {withCredentials: true, responseType: 'text'}).subscribe(res => {
    });
    return result;
  }

  logout(): void {
    this.putLogout();
  }

  clearNotification(): void {
    this.el.nativeElement.querySelector("#disp_name_changed").style.display = "none";
    this.el.nativeElement.querySelector("#email_alert").style.display = "none";
    this.el.nativeElement.querySelector("#email_changed").style.display = "none";
    this.el.nativeElement.querySelector("#phone_alert").style.display = "none";
    this.el.nativeElement.querySelector("#phone_changed").style.display = "none";
    this.el.nativeElement.querySelector("#zip_alert").style.display = "none";
    this.el.nativeElement.querySelector("#zip_changed").style.display = "none";
    this.el.nativeElement.querySelector("#password_alert").style.display = "none";
    this.el.nativeElement.querySelector("#password_changed").style.display = "none";
  }

  async putDisplayName(newDisplayName:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putDisplay = new Promise(resolve => this.http.put(this.authServ.backendUrl + "displayname/", {
      displayname: newDisplayName
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putDisplay;
    return result;
  }

  async putEmail(newEmail:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putNew = new Promise(resolve => this.http.put(this.authServ.backendUrl + "email/", {
      email: newEmail
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putNew;
    return result;
  }

  async putPhone(newPhone:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putNew = new Promise(resolve => this.http.put(this.authServ.backendUrl + "phone/", {
      phone: newPhone
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putNew;
    return result;
  }

  async putZipcode(newZipcode:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putNew = new Promise(resolve => this.http.put(this.authServ.backendUrl + "zipcode/", {
      zipcode: newZipcode
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putNew;
    return result;
  }

  async putPassword(newPassword:string): Promise<string>{
    let result = "";
    let login = new Promise(resolve => this.http.post(this.authServ.backendUrl + "login", {
      username: this.curUsername,
      password: this.curPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await login;
    let putNew = new Promise(resolve => this.http.put(this.authServ.backendUrl + "password/", {
      password: newPassword
    }, {withCredentials: true}).subscribe(res => {
      resolve("done");
    }));
    await putNew;
    return result;
  }

  updateInfo(): void {
    let name = this.updateForm.value.name;
    //TODO: check whether new name is a conflict
    if (name != this.curDisplayName && name) {
      let oldName = this.curDisplayName;
      this.curDisplayName = name;
      this.putDisplayName(name).then(ret => {
        this.getCurProfile();
      })
      this.el.nativeElement.querySelector("#disp_name_before").innerHTML = oldName;
      this.el.nativeElement.querySelector("#disp_name_after").innerHTML = name;
      this.el.nativeElement.querySelector("#disp_name_changed").style.display = "inline";
    } else {
      this.el.nativeElement.querySelector("#disp_name_changed").style.display = "none";
    }
    this.el.nativeElement.querySelector("#name").value = "";

    let email = this.updateForm.value.email;
    if (email != this.curEmail && email) {
      if (this.checkEmail(email)) {// check success
        let oldEmail = this.curEmail;
        this.curEmail = email;
        this.putEmail(email).then(ret => {
          this.getCurProfile();
        })
        // the email is ready to be changed
        this.el.nativeElement.querySelector("#email_before").innerHTML = oldEmail;
        this.el.nativeElement.querySelector("#email_after").innerHTML = email;
        this.el.nativeElement.querySelector("#email_alert").style.display = "none";
        this.el.nativeElement.querySelector("#email_changed").style.display = "inline";
      } else {// check fail
        this.el.nativeElement.querySelector("#email_alert").style.display = "inline";
        this.el.nativeElement.querySelector("#email_changed").style.display = "none";
      }
    } else { // form empty
      this.el.nativeElement.querySelector("#email_alert").style.display = "none";
      this.el.nativeElement.querySelector("#email_changed").style.display = "none";
    }
    // empty form
    this.el.nativeElement.querySelector("#email").value = "";

    let phone = this.updateForm.value.phone;
    if (phone && phone != this.curPhone) {
      if (this.checkPhone(phone)) {
        let oldPhone = this.curPhone;
        this.curPhone = phone;
        this.putPhone(phone).then(ret => {
          this.getCurProfile();
        })
        this.el.nativeElement.querySelector("#phone_before").innerHTML = oldPhone;
        this.el.nativeElement.querySelector("#phone_after").innerHTML = phone;
        this.el.nativeElement.querySelector("#phone_alert").style.display = "none";
        this.el.nativeElement.querySelector("#phone_changed").style.display = "inline";
      } else {
        this.el.nativeElement.querySelector("#phone_alert").style.display = "inline";
        this.el.nativeElement.querySelector("#phone_changed").style.display = "none";
      }
    } else {
      this.el.nativeElement.querySelector("#phone_alert").style.display = "none";
      this.el.nativeElement.querySelector("#phone_changed").style.display = "none";
    }
    this.el.nativeElement.querySelector("#phone").value = "";

    let zipcode = this.updateForm.value.zipcode;
    if (zipcode && zipcode != this.curZipcode) {
      if (this.checkZipcode(zipcode)) {
        let oldZipcode = this.curZipcode;
        this.curZipcode = zipcode;
        this.putZipcode(zipcode).then(ret => {
          this.getCurProfile();
        })
        this.el.nativeElement.querySelector("#zip_before").innerHTML = oldZipcode;
        this.el.nativeElement.querySelector("#zip_after").innerHTML = zipcode;
        this.el.nativeElement.querySelector("#zip_alert").style.display = "none";
        this.el.nativeElement.querySelector("#zip_changed").style.display = "inline";
      } else {
        this.el.nativeElement.querySelector("#zip_alert").style.display = "inline";
        this.el.nativeElement.querySelector("#zip_changed").style.display = "none";
      }
    } else {
      this.el.nativeElement.querySelector("#zip_alert").style.display = "none";
      this.el.nativeElement.querySelector("#zip_changed").style.display = "none";
    }
    this.el.nativeElement.querySelector("#zipcode").value = "";

    let password = this.updateForm.value.password;
    let password_confirm = this.updateForm.value.password_confirm;
    if (!password || !password_confirm) { // at least one is empty
      this.el.nativeElement.querySelector("#password_alert").style.display = "none";
      this.el.nativeElement.querySelector("#password_changed").style.display = "none";
    } else if (password == this.curPassword) {
      this.el.nativeElement.querySelector("#password_alert").style.display = "none";
      this.el.nativeElement.querySelector("#password_changed").style.display = "none";
    } else {
      if (this.checkPassword(password, password_confirm)) {
        let oldPasswordStar = this.makeStar(this.curPassword);
        let newPasswordStar = this.makeStar(password);
        this.curPassword = password;
        this.putPassword(password).then(ret => {
          this.getCurProfile();
        })
        this.el.nativeElement.querySelector("#pass_before").innerHTML = oldPasswordStar;
        this.el.nativeElement.querySelector("#pass_after").innerHTML = newPasswordStar;
        this.el.nativeElement.querySelector("#password_alert").style.display = "none";
        this.el.nativeElement.querySelector("#password_changed").style.display = "inline";
      } else {
        this.el.nativeElement.querySelector("#password_alert").style.display = "inline";
        this.el.nativeElement.querySelector("#password_changed").style.display = "none";
      }
    }
    this.el.nativeElement.querySelector("#password").value = "";
    this.el.nativeElement.querySelector("#password_confirm").value = "";
  }

  checkEmail(email:string): boolean {
    let cnt = 0;
    for (let i = 0; i < email.length; i++) {
      if(i==0 && email[i]=='@') {
        return false;
      }
      if(i==email.length-1 && email[i]=='@') {
        return false;
      }
      if (email[i]=='@') cnt++;
    }
    if (cnt!=1) return false;
    return true;
  }


  checkPhone(phone:string): boolean {
    if (phone.length!=12) return false;
    if (phone.charAt(3)!='-' || phone.charAt(7)!='-') return false;
    for (let i = 0; i < phone.length; i++) {
      if (i==3 || i==7) continue;
      if (phone.charAt(i) <= '9' && phone.charAt(i) >= '0') continue;
      else return false;
    }
    return true;
  }

  checkZipcode(zipcode:string): boolean {
    if(zipcode.length!=5) return false;
    for (let i = 0; i < zipcode.length; i++) {
      if (zipcode[i]>='0' && zipcode[i]<='9') continue;
      else return false;
    }
    return true;
  }

  checkPassword(password:string, password_confirm:string): boolean {
    if (password != password_confirm) return false;
    return true;
  }

  makeStar(password:string): string {
    let pass_encode = "";
    for(let i=0;i<password.length;i++) pass_encode += "*";
    return pass_encode;
  }

}
