// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showDialog: false,
    userName:'',
    passWord:'',
    saveCount:true,
  },

  switchStatus(){
    this.setData({
      saveCount:!this.data.saveCount
    })
  },
  login(){
    const that = this /* 进入request之后this就是request的了，虽然这里saveCount放在外面没使用，还是保存一下，以后做*/
    const postData = {
      userName:this.data.userName,
      passWord:this.data.passWord
    }
    // wx.showLoading({
    //   title: '登录中...',
    // })
    if(that.data.saveCount){
      wx.setStorageSync('account', postData)
    }else{
      wx.removeStorage({
        key: 'account',
      })
    }

    const db = wx.cloud.database({
      env:'cloud1-0g6xxe0n76b03f4b'
    })

    db.collection('todos').where({
      userName:this.data.userName
    })
    .get({
      success: function(res) {
        console.log(res.data)
        if(res.data.length == 0){
          wx.showToast({
            title: '用户不存在',
            icon:'error'
          })
        }else{
          if(res.data[0].passWord != that.data.passWord){
            wx.showToast({
              title: '密码错误',
              icon:'error'
            })
            return
          }
          // wx.hideLoading()
          wx.showToast({
            title: '登录成功',
          })
          getApp().globalData.workList = res.data[0].tasks
          getApp().globalData.serch_id = res.data[0]._id
          setTimeout(()=>{
            wx.redirectTo({
              url: '/pages/timeTable/timeTable',
            })
          },1500)
        }
      },
    })    
  },


  initAccount(){
    const accountCache = wx.getStorageSync('account')
    if(accountCache){
      this.setData({
        ...accountCache
      })
    }
  },

  signin(){
    this.setData({
      showDialog: true,
    });
  },

  hideAddDialog(){
    this.setData({
      showDialog: false,
    });
  },

  userNameFillIn(e){
    this.setData({
      userName:e.detail.value
    })
  },
  passWordFillIn(e){
    this.setData({
      passWord:e.detail.value
    })
  },

  submiteDialog(){
    const that = this
    // 从数据库读不存在则创建，否则提示用户存在
    const db = wx.cloud.database({
      env:'cloud1-0g6xxe0n76b03f4b'
    })

    db.collection('todos').where({
      userName:this.data.userName
    })
    .get({
      success: function(res) {
        if(res.data.length == 0){

          db.collection('todos').add({
            data:{
              passWord:that.data.passWord,
              userName:that.data.userName,
              tasks:[]
            },
            success:(res)=>{
              console.log("成功了")
              
              wx.showToast({
                title: '创建成功',
                icon:'success'
              })
              that.setData({
                showDialog: false,
              });
            }
          })
        }else{
          wx.showToast({
            title: '名字已存在',
            icon:'error'
          })
        }
      },
    }) 
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initAccount()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})