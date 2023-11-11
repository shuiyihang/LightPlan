// pages/timeTable/timeTable.js
Page({
  data: {
    showDialog: false,
    showWorkInfo:false,
    weekText:['一','二','三','四','五','六','日'],
    colorList:[
      '#e54d42',
      '#f37b1d',
      '#fbbd08',
      '#8dc63f',
      '#39b54a',
      '#0081ff',
      '#6739b6',
      '#e03997',
      '#333333'
    ],
    multiArray: [
      ['周一', '周二','周三','周四','周五','周六','周日'],
      [1,2,3,4,5,6,7,8,9,10,11,12],
      [1,2,3,4,5,6]
    ],
    multiIndex:[0,0,0],
    newWorkItem:{
      abstract:'',
      week:1,
      section:1,
      duration:1,
      info:''
    },
    workList:[],
    dayList:[0,0,0,0,0,0,0]
  },

  showAddDialog() {
    this.setData({
      showDialog: true,
    });
    // console.log("showAddDialog")
  },

  hideAddDialog() {
    this.setData({
      showDialog: false,
    });
  },

  abstractFillIn(e){
    const currentData = this.data.newWorkItem;
    currentData.abstract = e.detail.value
    this.setData({
      newWorkItem:currentData
    })
    // console.log("文字填充",this.data.newWorkItem)
  },

  textareaAInput(e){
    const currentData = this.data.newWorkItem;
    currentData.info = e.detail.value
    this.setData({
      newWorkItem: currentData
    })
  },

  MultiChange(e){
    const currentData = this.data.newWorkItem;
    currentData.week = e.detail.value[0] + 1
    currentData.section = e.detail.value[1] + 1
    currentData.duration = e.detail.value[2] + 1
    this.setData({
      multiIndex: e.detail.value,
      newWorkItem:currentData
    })
    console.log("多选改变",this.data.newWorkItem)
  },

  submiteDialog(){
    if(this.data.newWorkItem.abstract === ''){
      wx.showToast({
        title: '描述不能为空哦',
        icon:'none'
      })
      return
    }
    const db = wx.cloud.database({
      env:'cloud1-0g6xxe0n76b03f4b'
    })
    const currentData = this.data.workList
    const itemCopy = JSON.parse(JSON.stringify(this.data.newWorkItem))

    for(let i = 0;i < currentData.length;i++){
      if(itemCopy.week == currentData[i].week){
        // 需要检查是否冲突
        if((itemCopy.section + itemCopy.duration <= currentData[i].section) || (itemCopy.section) >= (currentData[i].section + currentData[i].duration)){
          continue
        }else{
          wx.showToast({
            title: '时间有冲突',
            icon:'error',
            duration:3000
          })
          return
        }
      }
    }

    // 需要检查是否超过时间限制
    if(itemCopy.section + itemCopy.duration > 13){
      wx.showToast({
        title: '超出时间段',
        icon:'error',
        duration:3000
      })
      return
    }


    currentData.push(itemCopy)

    this.setData({
      workList:currentData,
      showDialog: false,
    })

    console.log("查看",itemCopy)
    db.collection('todos').doc(getApp().globalData.serch_id).update({
      data:{
        tasks:db.command.push(itemCopy)
      },
      success:function(res){
        console.log('成功了',res)
      }
    })

  },

  deleteView(e){
    const that = this
    const recordId = e.currentTarget.dataset.recordid;
    console.log('记录的id',recordId)
    const db = wx.cloud.database({
      env:'cloud1-0g6xxe0n76b03f4b'
    })
    db.collection('todos').doc(getApp().globalData.serch_id).update({
      data:{
        tasks:db.command.pull({
          abstract:db.command.eq(recordId)
        })
      }
    })


    db.collection('todos').doc(getApp().globalData.serch_id)
    .get()
    .then(res=>{
      console.log('res:',res,res.data.tasks)
      if(res.data.length == 0){
        getApp().globalData.workList = []
      }else{
        getApp().globalData.workList = res.data.tasks.slice()
      }
      console.log('全局list',getApp().globalData.workList)
      that.setData({
        workList:getApp().globalData.workList
      })
      console.log('现在的worklist',that.data.workList)
    })
  },

  seeDetails(e){
    const recordId = e.currentTarget.dataset.recordid;
    // 点击查看细节
    const db = wx.cloud.database({
      env:'cloud1-0g6xxe0n76b03f4b'
    })

    db.collection('todos').doc(getApp().globalData.serch_id)
    .get()
    .then(res=>{
      console.log('res:',res,res.data.tasks)
      if(res.data.length == 0){
        getApp().globalData.workList = []
      }else{
        getApp().globalData.workList = res.data.tasks.slice()
      }
      for(let i = 0;i < res.data.tasks.length;i++){
        if(res.data.tasks[i].abstract === recordId){
          wx.showModal({
            title: '详情',
            content: res.data.tasks[i].info || '空空如也~',
            showCancel:false,
            complete: (res) => {
              if (res.cancel) {
                
              }
          
              if (res.confirm) {
                
              }
            }
          })
          return
        }
      }
 
    })

    this.setData({
      showWorkInfo:true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.getSystemInfo({
      success: (res)=>{
        // 获取当前时间
        const currentTime = new Date()
        const currentMonth = currentTime.getMonth() + 1
        // 获取当前星期几，0 表示星期天，1 表示星期一，以此类推
        const currentWeekDay = currentTime.getDay()
        const windowWidth = res.windowWidth

        // getDate获取第几天
        const weekDates = [];
        for (let i = 1; i < 8; i++) {
          const day = new Date(currentWeekDay);
          // 
          day.setDate(currentTime.getDate() - ((currentWeekDay === 0) ? 7:(currentWeekDay)) + i);
          weekDates.push(day.getDate());
        }
        this.setData({
          currentWeekDay,
          currentMonth,
          windowWidth,
          dayList:weekDates
        })
        console.log("日期",this.data.dayList)
        // console.log('月',this.data.currentMonth,'周',currentWeekDay,'宽',windowWidth)
      }
    })

  },
  checkboxChange(e){
    console.log("检查盒子",e.detail.value)
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
    this.setData({
      workList:getApp().globalData.workList
    })
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