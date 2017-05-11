// JavaScript Document
$(function(){
var ZU_verify = {

    rules:['isMobile', 'isEmail', 'minLength', 'maxLength', 'length', 'isAsso', 'empty', 'isEmoji', 'ismyuser', 'ismyps', 'isDoublePass', 'isChecked'],

    funcs:{
        failed:function(input,msg){
            input.parent('div').find('.form_error').text(msg).removeClass('none')
        },
        success:function(input){
           input.parent('div').find('.form_error').text('').addClass('none')
        }
    },
    isAsso:function(val){
        if( this.isMobile(val)==true||this.isEmail(val)==true ){
            return true;
        };
        return false;
    },
    isMobile:function(val){
        return /^1[34578]{1}\d{9}$/.test(val);
    },
    isEmail:function(val){
        return /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(val);
    },
    minLength:function(val, min_length) {
        return new RegExp('^\\S{' + min_length + ',}$').test(val);
    },
    maxLength:function(val, max_length) {
        return new RegExp('^\\S{0,' + max_length + '}$').test(val);
    },
    length: function(val, length) {
        return new RegExp('^\\S{' + length + '}$').test(val);
    },
    ismyuser:function(val){
        return /^[a-zA-Z0-9-_]{6,20}$/.test(val);
    },
    ismyps:function(val){
        return  /^[a-zA-Z0-9]{6,20}$/.test(val);
    },
    content:function(attrs) {
        var errorArr = attrs.split('|');
        return errorArr;
    },
    isDoublePass:function(val){
        if(val==$('#password').val()){
            return true;
        }
        return false;
    },
    isChecked:function(attr){
        if(attr){
            return true;
        }
        return false;
    },
     isValid: function(input) {
        for (i = 0; i < this.rules.length; i++) {
            var func = this.rules[i];
            if (input.attr("valid-" + func) != undefined) {
                if (input.val().trim()=="") {// 当前失去焦点的input 去掉空格 是否为空
                    var valid_empty = input.attr('valid-empty');
                    if (valid_empty != undefined && valid_empty != 'false') {
                        this.funcs.failed(input, this.content(valid_empty)[1]);
                        return false;
                    }
                } else {
                    if(func=='isEmoji'){
                        var result = !this.isEmoji(input.val());
                    } else if (func == 'isEmail') {
                        var result = this.isEmail(input.val());
                    } else if (func == 'isMobile') {
                        var result = this.isMobile(input.val());
                    } else if (func == 'minLength') {
                        var result = this.minLength(input.val(), this.content(input.attr("valid-" + func))[0]);
                    } else if (func == 'maxLength') {
                        var result = this.maxLength(input.val(), this.content(input.attr("valid-" + func))[0]);
                    } else if (func == 'length') {
                        var result = this.length(input.val(), this.content(input.attr("valid-" + func))[0]);
                    } else if (func == 'isAsso') {
                        var result = this.isAsso(input.val());
                    } else if (func == 'ismyuser'){
                        var result = this.ismyuser(input.val());
                    } else if (func == 'ismyps'){
                        var result = this.ismyps(input.val());
                    } else if (func == 'isDoublePass'){
                        var result = this.isDoublePass(input.val());
                    }else if (func == 'isChecked'){
                        var result = this.isChecked(input.prop('checked'));
                    }
                    if (result == false) {
                        this.funcs.failed(input, this.content(input.attr("valid-" + func))[1]);
                        return false; // 只要return false 表单不提交 js不在向下运行 
                    }
                }
            }
        }
        this.funcs.success(input);
        return true;
    }

};
var setForm={
        setMobileCode:function(btn,mobile){ 
            if (btn.hasClass('disabled')) {
                  return false;
            }else if(!ZU_verify.isValid($("#captcha"))){    
                return false;
            }
            $.ajax({
                  type: 'POST',
                  url: ctx+'/common/valicode/getValiCode/'+mobile,
                  data:{
                      'captcha':$("#captcha").val()
                  },
                  success:function(resp){
                      //console.log(resp);
                      if(resp.code=="0"){
                          btn.addClass('disabled');
                          setForm.countDown(btn);
                          $('.form-error').addClass('none').text('');
                      }else{
                         $('.form-error').removeClass('none').text(resp.msg);
                         setForm.getCaptcha($('#AuthCodeImg'));
                      }
                  },
                  error:function(resp){
                      console.log(resp);
                  }
            });
        },
        countDown:function(btn){
            var countdown = 60;
            var _si = setInterval(function() {
                if (countdown <= 0) {
                    if(btn.parent().find('.times').length){
                        btn.removeClass('disabled').parent().find('p').addClass('none');
                    }else{
                        btn.removeClass('disabled').text('获取验证码');
                    }
                  
                  clearInterval(_si);
                  return true;
                }
                countdown--;
                if(btn.parent().find('.times').length){
                    btn.parent().find('p').removeClass('none').find('.times').text(countdown);
                }else{
                    btn.text(countdown+'S');
                }
                
             }, 1000);
        },
        post: function(form,func) {  
            var action = form.attr('action');
            var data = form.serialize();
            $.ajax({
                  type: 'POST',
                  url: action,
                  data: data,
                  success:function(resp){
                      //console.log()
                    if(resp.code=='0'){
                        if (func != undefined) {
                            func(resp);
                           // return true;
                        }
                        var src =$('.submit').data('url');
                        if(src){
                            window.location.href=src;
                        }
                        
                    }else{
                        $('.form-error').removeClass('none').text(resp.msg);
                        setForm.getCaptcha($('#AuthCodeImg'));
                    }
                  },
                  error:function(resp){
                      console.log(resp);
                  }
            }); 
        },
        getCaptcha:function(self){
            var num=parseInt(10*Math.random());
            changeUrl=ctx+'/getCaptcha?'+num;   
            self.attr("src",changeUrl);
        }
};

$(function(){

    //图片验证码
    setForm.getCaptcha($('#AuthCodeImg'));
    $('body').on('click', '.set-pic-code', function() {
        setForm.getCaptcha($('#AuthCodeImg'));
    });
    //表单验证
    $('body').on('blur', '.form-input input:not([type="submit"]),.form-input textarea', function() {
        ZU_verify.isValid($(this));
    });
    //获取验证码  
    $('body').on('click', '.set-mobile-code', function() {
        if(ZU_verify.isValid($('.mobile-text'))){
            var btn=$(this);
            var mobile=$('.mobile-text').val();
            setForm.setMobileCode(btn, mobile);
        }
    });
   
    //表单提交
    $('body').on('submit', '.form-input', function(event) {
        event.preventDefault(); //阻止默认事件 form不提交
        var form = $(this);
        var bOff = true;
        $('.form-input input,.form-input textarea').each(function() {
          if (ZU_verify.isValid($(this)) == false) {
            bOff = false;
            return false;
          }
        });
        if (bOff) {
            setForm.post($(this));
        }
     });
});



});
