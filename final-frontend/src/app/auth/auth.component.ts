import {Component, ElementRef, OnInit, AfterViewInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {User} from "./user";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

/*
Bret
Kulas Light
*/

export class AuthComponent implements OnInit {
  imgURL: string;
  curTime: Date;
  regForm: FormGroup;
  loginForm: FormGroup;
  isLoginError: boolean;
  backendUrl: string;

  constructor(private el:ElementRef, private authServ: AuthService, private router:Router, private http: HttpClient) {
    this.imgURL = "../../assets/images/auth/landingPage.jpg";
    this.curTime = new Date();
    this.regForm = new FormGroup({
      ac_name: new FormControl(''),
      dis_name: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
      birth: new FormControl(''),
      zip: new FormControl(''),
      password: new FormControl(''),
      password_confirm: new FormControl(''),
      timestamp: new FormControl('')
    });
    this.loginForm = new FormGroup({
      log_ac_name: new FormControl(''),
      log_password: new FormControl(''),
      // log_timestamp: new FormControl('')
    });
    this.isLoginError = false;
    this.backendUrl = authServ.backendUrl;
  }

  // pull data from server
  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const phone = this.el.nativeElement.querySelector('#phone');
    phone.addEventListener("input",function (){
      if(phone.validity.patternMismatch)
        phone.setCustomValidity("Expect proper format of 123-123-1234");
      else
        phone.setCustomValidity("");
    });

    const zip = this.el.nativeElement.querySelector('#zip');
    zip.addEventListener("input",function (){
      if(zip.validity.patternMismatch)
        zip.setCustomValidity("Expect proper format of 12345");
      else
        zip.setCustomValidity("");
    });
  }

  checkLogin() {
    let logPass = false;
    this.authServ.loginUser(this.loginForm.value.log_ac_name, this.loginForm.value.log_password).then(result => {
      if (result == "success") {
        logPass = true;
        this.router.navigate(['/main']);
      } else {
        alert(result);
      }
    });
  }

  logout(regUsers: User[]): void {
    for (let i = 0; i < regUsers.length; i++) {
      if (regUsers[i].isLogged) {
        regUsers[i].logout();
        break;
      }
    }
    return;
  }

  onLoad(): void {
    this.curTime = new Date();
  }

  checkAll(){
    let checkPass = this.passwordCheck() && this.ageCheck() && this.accountNameCheck();
    if (checkPass) {
      this.authServ.registerUser(this.regForm.value.ac_name, this.regForm.value.password, this.regForm.value.dis_name, this.regForm.value.email, this.regForm.value.phone, this.regForm.value.zip, new Date(this.regForm.value.birth).getTime()).then(result => {
        if (result == "success") {
          alert("Registration successful! You can now login with your new account! ");
          // empty all inputs
          this.el.nativeElement.querySelector("#ac_name").value = "";
          this.el.nativeElement.querySelector("#dis_name").value = "";
          this.el.nativeElement.querySelector("#email").value = "";
          this.el.nativeElement.querySelector("#phone").value = "";
          this.el.nativeElement.querySelector("#birth").value = "";
          this.el.nativeElement.querySelector("#zip").value = "";
          this.el.nativeElement.querySelector("#password").value = "";
          this.el.nativeElement.querySelector("#password_confirm").value = "";
        } else {
          alert(result);
        }
      })
    }
    return;
  }

  passwordCheck(): boolean {
    // let password = this.el.nativeElement.querySelector('#password').value;
    let password = this.regForm.value.password;
    let passwordConfirm = this.regForm.value.password_confirm;
    if(password != passwordConfirm)
    {
      alert("Two passwords are not the same! ");
      return false;
    }
    else return true;
  }

  ageCheck(): boolean {
    let date_birth = this.regForm.value.birth;
    let year_birth = date_birth.substring(0,4);
    let month_birth = date_birth.substring(5,7);
    let day_birth = date_birth.substring(8,10);
    let year_cur = this.curTime.getFullYear();
    let month_cur = this.curTime.getMonth() + 1;
    let day_cur = this.curTime.getDate();
    if(year_cur - year_birth < 18)
    {
      alert("Underage attempt! ");
      return false;
    }
    else if(year_cur - year_birth == 18)
    {
      if(month_cur < month_birth)
      {
        alert("Underage attempts! ");
        return false;
      }
      else if(month_cur == month_birth)
      {
        if(day_cur < day_birth)
        {
          alert("Underage attempts! ");
          return false;
        }
      }
    }
    return true;
  }

  accountNameCheck(): boolean {
    let name = this.regForm.value.ac_name;
    for(let i=0;i<name.length;i++)
    {
      if(name[i]>='a'&&name[i]<='z') continue;
      else if(name[i]>='A'&&name[i]<='Z') continue;
      else if(name[i]>='0'&&name[i]<='9')
      {
        if(i==0)
        {
          alert("Account name may not start with a number! ");
          return false;
        }
        else continue;
      }
      else
      {
        alert("Account name can only be upper or lower case letters and numbers! ");
        return false;
      }
    }
    return true;
  }



}
