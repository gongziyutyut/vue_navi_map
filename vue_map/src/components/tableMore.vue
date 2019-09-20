<template>
    <!--
        支持多级表头，取数据时以最后一级为准  比如[{obj1:{}},{obj2:{}}]表内容取obj2
        表头的参数配置
        表头为操作，多选，序号时
                // operation:{label:"操作",minWidth:100},   //操作
                //check:{label:"",minWidth:80},   //全选未完成单选不好使
                // numB:{label:"序号",minWidth:60},    //序号
            id:{isNoEdit:true}  这一列不可以编写 isNoEdit:true
            id:{colspan:2,rowspan:2}   合并表头单元格
            id:{limits:true}       -5到5的输入范围
            id:{width:100,min-width:100}   当前列的宽和最大宽度
            id:{align:"center"}  单列的内容居中，支持left，center，right
            表头的搜索功能  search
            id:{label:"编号",search:{
                    isShow:false,type:"input",label:"编号",placeholder:"请输入编号"
                },isFilter:true},
                isShow  弹框的显示隐藏
                type  搜索框的内容跟    input纯输入框   select下拉选择   checkbox多选
                      作价规则的tab    selectInput输入框   selectSingle单选  range范围
                label  表头文字
                termArr 单选数组
                placeholder    输入提示内容
                inputType 输入框的类型 ：'date'日期
                last:true 最后一列
            searchCallback(){}输入的确定回调
            表头的排序
            id:{label:"编号",isFilter:true},
     -->
    <div class="table80-wrap" :class="{checkedBG:(customDisplay && customDisplay.checkedBG)}" onselectstart="return false">
        <div class="clear search-bar " v-show="searchCondition.length>0" ref="searchCondition">
            <ul class="searchCondition fl">
                <!--selectInput-->
                <li v-for="(item,index) in searchCondition" :key="index" v-if="item.filedType=='selectInput'"><span class="c-black">{{item.toolTipCurName}}</span><span>{{item.name}}：</span><span>{{item.condition}}</span><i class="el-icon-close" @click="searchDel(item)"></i></li>
                <!--range or tab(为页面收索的时候)-->
                <li v-for="(item,index) in searchCondition" :key="index" v-if="item.filedType=='range'||(item.filedType=='tab'&&item.activeTab=='first'&&item.toolTipCurName!='作价规则')"><span class="c-black">{{item.toolTipCurName}}</span><span v-if="item.value1!=''">{{item.name1}}：</span><span v-if="item.value!=''">{{item.value1}}</span><span class="c-black" v-if="item.value2!=''&&item.value1!=''">和</span><span v-if="item.value2!=''">{{item.name2}}：</span><span v-if="item.value2!=''">{{item.value2}}</span><i class="el-icon-close" @click="searchDel(item)"></i></li>
                <!--作价规则-->
                <li v-for="(item,index) in searchCondition" :key="index" v-if="item.filedType=='tab'&&item.activeTab=='first'&&item.toolTipCurName=='作价规则'">
                    <span class="c-black">作价规则</span>
                    <span>包含:{{item.ruleStr}}</span>
                    <i class="el-icon-close" @click="searchDel(item)"></i>
                </li>
              <!--单选-->
              <li v-for="(item,index) in searchCondition" :key="index" v-if="item.filedType=='selectSingle'"><span class="c-black">{{item.toolTipCurName}}</span><span>包含:{{item.value}}</span><i class="el-icon-close" @click="searchDel(item)"></i></li>
            </ul>
           <a class="search-btn marginRight0 fr" @click="termSearch()">页面搜索确定</a>
        </div>

        <div class="wrap-table" ref="tableWrap">
            <div class="wrap-table-head" ref="tableHead" @mousemove.prevent='mousemove($event)'>
                <transition name="fade">
                 <div class="table-head-tooltip" v-if="showTooltip" @click.stop="showTooltip=true" :style="toolTipStyle">
                    <i class="arrow-up" :class="{last:isLastFiled}"></i>
                    <search-module ref="tabToolTip"  :search="curSearch"  @searchCallback="searchCallback"  :filed="curFiled" @hideTooltip="hideToolTip" ></search-module>
                 </div>
                </transition>
                <table>
                  <thead id="full_table_header">
                      <tr v-for="(tableH,tableHInd) in tableHeader" :key="tableHInd">
                        <th v-for="(tableHVal,key) in tableH"
                        :key="key" v-if="(!tableHVal.isNoShow&&!tableHVal.isSpecial&&!(hiddenColumn.split(',').indexOf(key)>-1))"
                        v-show="!(cols10 && key==='operation')"
                        :align="tableHVal.align?tableHVal.align:'center'"
                        :rowspan="tableHVal.rowspan?tableHVal.rowspan:1"
                        :colspan="tableHVal.colspan?tableHVal.colspan:1"
                        :data-column="key">
                          <div  @contextmenu.prevent="contextmenuShow($event,'del')" v-if="key==='check'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}"><el-checkbox @change="checkAllFun" v-model="checkAll" :disabled="!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1">全选</el-checkbox></div>
                          <div v-else class="cell" :class="{searchM:tableHVal.search,cellHd:!tableHVal.search}" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">

                              <span  class="searchMSpan"  @click.stop="popup(tableHVal,key,$event,tableHVal.label)" :title="tableHVal.label">
                                  {{tableHVal.label}}
                              </span>
                                <div v-if="tableHVal.isFilter" class="tableHeadFilter" >
                                  <i class="triangle-up" title="升序" @click.stop="tableSort('asc',tableHVal,key,$event,tableHVal.search)" ref="tableSortAsc"></i>
                                  <i class="triangle-down" title="降序" @click.stop="tableSort('desc',tableHVal,key,$event,tableHVal.search)" ref="tableSortDesc"></i>
                              </div>
                          </div>
                          <span v-if="!tableHVal.colspan" class="headRight" @mousedown="mousedown(tableH,key, $event)"></span>
                        </th>
                        <!--审定数-->
                        <th v-for="(tableHVal,key) in tableH" v-if="tableHVal.isSpecial" :align="tableHVal.align?tableHVal.align:'center'" :key="key">
                            <div  class="cell"  :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                                    {{tableHVal.label}}
                            </div>
                            <span v-if="!tableHVal.colspan" class="headRight" @mousedown="mousedown(tableH,key, $event)"></span>
                        </th>
                      </tr>
                  </thead>
                </table>
            </div>

            <div class="wrap-table-body clusterize-scroll" @mouseover="mouseoverFun('right')" @scroll.stop="loadMore($event, 'right')" @contextmenu.prevent="contextmenuShow" ref="tableScroll" id="tableExampleScroll">
                <div class="noData" :class="{noDataCols10:cols10}" v-if='resultData.length===0'>暂无数据</div>
                <table class="tableBody clusterize-content" ref="tableBody" v-if="sheetName!='利润表'&&sheetName!='资产负债表'&&sheetName!='审定数'" :style="{height: contentHeight}">
                    <tbody id="tableExampleContent">
                        <tr v-for="(tableR,tableRInd) in tableRowData" @click="addBg(tableRInd)" :key="tableRInd">
                            <td
                            v-for="(tableHVal,key,indx) in tableHeader[tableHeader.length-1]"
                            :key="key"
                            v-if="!tableR.trIsHide&& !(hiddenColumn.split(',').indexOf(key)>-1)"
                            v-show="!(cols10 && key==='operation') "
                            :align="tableHVal.align?tableHVal.align:'center'"
                            :class="tableHVal.align?tableHVal.align:'center'"
                            :data-cr="JSON.stringify(tableRInd)+','+key+','+tableR.id+','+tableR.numB+','+indx"
                            >
                                <!-- 操作 -->
                                <div v-if="key==='operation'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                                    <img class="operation-icon operationHover" src="/static/img/operation.png" alt="" @click.stop="operationFun($event,tableR,tableHVal)">
                                </div>
                                <!-- 多选 -->
                                <div v-else-if="key==='check'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                                  <el-checkbox v-model="tableR[key]" @change="checkedFn(tableR[key],tableR)" :disabled="!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1"></el-checkbox>
                                </div>
                                <!-- 序号 -->
                                <div v-else-if="key==='numB'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                                    {{tableR[key]}}
                                </div>
                                <!-- 其他内容 -->
                                <div v-else class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}"
                                @contextmenu.stop.prevent="sign($event,tableR,key,tableRInd,'mid')"
                                @click="setCheckedBG($event,tableR,key,tableRInd)"
                                :class="{checkedBlueCell:checkedBgObj.id==tableR.id&&checkedBgObj.key==key&&tableR[key]!=''}">
                                    <el-input :class="{isWarning:tableR[key]=='#N/A',isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}"  v-if="(tableR['disableColumns'].split(';')).indexOf(key)>-1 || setDisabled(tableR,key)" :disabled="true || $store.state.notOperableSheetNames.indexOf(sheetName)>-1" v-model="tableR[key]"></el-input>
                                    <el-select v-else-if="tableHVal.selected" v-model="tableR[key]" :disabled="tableR.id==''|| $store.state.notOperableSheetNames.indexOf(sheetName)>-1 ||!$store.state.readonly  || cols10 || (customDisplay && customDisplay.disabled)" @change="blurInp(tableR,key,$event,tableRInd,'作价规则')"
                                    :class="{isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}">
                                         <el-option
                                            v-for="item in tableHVal.search.rule"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                        </el-option>
                                    </el-select>
                                    <el-select v-else-if="tableHVal.isSelect" v-model="tableR[key]"  @change="blurInp(tableR,key,$event,tableRInd,'是否进口')" :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"
                                    :class="{isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}"
                                     filterable
                                     @paste.native.capture.prevent="pasteFromExcel($event,tableR,key,tableRInd,tableHVal,indx)">
                                         <el-option
                                            v-for="item in tableHVal.options"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                        </el-option>
                                    </el-select>
	                                 <el-date-picker v-else-if="tableHVal.search && tableHVal.search.inputType=='date'"  v-model="tableR[key]" type="date" placeholder="选择日期"
	                                  format="yyyy/MM/dd"
	                                  value-format="yyyy/MM/dd"
	                                  :editable="$store.state.readonly||!cols10"
	                                  :clearable="false"
                                    :ref="'date' + key + tableRInd"
                                    @focus="selectDatePicker(key, tableRInd)"
                                    :disabled="!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"
	                                  @input="blurInp(tableR,key,$event,tableRInd,1,tableHVal)"
                                    @paste.native.capture.prevent="pasteFromExcel($event,tableR,key,tableRInd,tableHVal,indx)"
                                    :class="{isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}">
	                                  </el-date-picker>
                                    <el-date-picker v-else-if="tableHVal.search && tableHVal.search.inputType=='year'" v-model="value5" type="year" placeholder="选择年" :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"></el-date-picker>
                                    <el-input v-else
                                      v-model="tableR[key]"
                                      @keyup.native="keyupInp($event,tableR,key)"
                                      @blur="blurInp(tableR,key,$event,tableRInd,'',tableHVal)"
                                      @focus="focusInp(tableR,key,$event)"
                                    	:class="{isWarning:tableR[key]=='#N/A',
                                                isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,
                                                isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1),
                                                isDrag:tableR.drag==key,
                                                isMoved:(tableR.moveCloum&&indx>=endTDMin&&indx<=endTDMax&&dragDec=='横向')||
                                                        (tableR.moveCloum&&tableR.moveCloum==key&&tableR.numB>=endTDMin&&tableR.numB<=endTDMax&&dragDec=='纵向')}"
                                      :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"
                                      @paste.native.capture.prevent="pasteFromExcel($event,tableR,key,tableRInd,tableHVal,indx)"
                                      :data-cr="JSON.stringify(tableRInd)+','+key+','+tableR.id+','+tableR.numB+','+indx">
                                    </el-input>
                                </div>
                                <!--拖拽的标点-->
                                <div class="drag-peg"
                                      v-if="tableR.drag==key&&tableR.id"
                                      @mousedown.stop="tdMousedown(tableRInd,key,$event,tableR.id,tableR.numB,indx)"
                                      :data-cr="JSON.stringify(tableRInd)+','+key+','+tableR.id+','+tableR.numB+','+indx">
                                </div>
                            </td>
                        </tr>
                        <!---->

                    </tbody>
                </table>

                <!--审定数,资产负债表,利润表-->
                <table v-else class="tableBody" ref="tableBody" :class="{isFixedWid:sheetName=='资产负债表'}">
                  <tbody :class="{isBalanceTable:sheetName=='资产负债表',isAuditedTable:sheetName=='审定数',isProfitTable:sheetName=='利润表'}">
                      <tr v-for="(tableR,tableRInd) in tableRowData" :key="tableRInd">
                        <td v-for="(tableHVal,key) in tableHeader[tableHeader.length-1]" :align="tableHVal.align?tableHVal.align:'center'" :class="tableHVal.align" :key="key">
                          <div class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                            <el-input :class="{isWarning:tableR[key]=='#N/A',isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1}" v-if="tableHVal.isNoEdit" :readonly="true" v-model="tableR[key]" ></el-input>
                            <!-- <el-input :class="{isWarning:tableR[key]=='#N/A',isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1}"
                              v-else-if="((sheetName=='资产负债表'&&tableRInd==31)&&(key=='F'||key=='G'||key=='H'||key=='I'||key=='J'))||(sheetName=='资产负债表'&&tableRInd==33)"
                             :readonly="true" >
                             </el-input> -->
                             <span  v-else-if="((sheetName=='资产负债表'&&tableRInd==31)&&(key=='F'||key=='G'||key=='H'||key=='I'||key=='J'))||(sheetName=='资产负债表'&&tableRInd==33)">
                                {{tableR[key]}}
                             </span>
                              <div class="cell" v-else-if="tableHVal.isSpecial"  @contextmenu.stop.prevent="sign($event,tableR,key,tableRInd,'mid')" @click="setCheckedBG($event,tableR,key,tableRInd)"
                              :class="{checkedBlueCell:checkedBgObj.id==tableR.id&&checkedBgObj.key==key&&tableR[key]!=''}">
                                <el-input
                                v-model="tableR[key]" @keyup.native="keyupInp"
                                @blur="blurInp(tableR,key,$event,tableRInd,'',tableHVal)"
                                @focus="focusInp(tableR,key,$event)"
                                :class="{isWarning:tableR[key]=='#N/A',isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1}"
                                :disabled="!$store.state.readonly||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || (customDisplay && customDisplay.disabled)">
                                </el-input>
                             </div>

                          </div>
                        </td>
                      </tr>
                  </tbody>
                </table>
            </div>
             <!--固定列 begin-->
            <div class="wrap-table-fixed" :class="{transparent:resultData.length===0}"  ref="tableFixed" v-show="sheetName!='利润表'&&sheetName!='资产负债表'&&sheetName!='审定数'">
              <div class="wrap-table-head" @mousemove.prevent='mousemove($event)'>
                <transition name="fade">
                 <div class="table-head-tooltip"  v-if="showTooltipFixed" @click.stop="showTooltipFixed=true" :style="toolTipStyle">
                    <i class="arrow-up"  :class="{last:isLastFiled}"></i>
                    <search-module ref="tabToolTip"  :search="curSearch"  @searchCallback="searchCallback"  :filed="curFiled" @hideTooltip="hideToolTip" ></search-module>
                 </div>
                </transition>
                <table>
                   <thead>
                       <tr v-for="(tableH,tableHInd) in tableHeader" :key="tableHInd">
                          <th v-for="(tableHVal,key) in tableH" 
                          :key="key" 
                          v-if="!tableHVal.isNoShow&&!tableHVal.isSpecial&&tableHVal.fixed&& !(hiddenColumn.split(',').indexOf(key)>-1)" 
                          v-show="!(cols10 && key==='operation')" 
                          :align="tableHVal.align?tableHVal.align:'center'" 
                          :rowspan="tableHVal.rowspan?tableHVal.rowspan:1" 
                          :colspan="tableHVal.colspan?tableHVal.colspan:1">
                            <div  @contextmenu.prevent="contextmenuShow($event,'del')" v-if="key==='check'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                              <el-checkbox @change="checkAllFun" v-model="checkAll" :disabled="!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1">全选</el-checkbox>
                            </div>
                            <div v-else class="cell" :class="{searchM:tableHVal.search,cellHd:!tableHVal.search}" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                                <span  class="searchMSpan"  @click.stop="popup(tableHVal,key,$event,tableHVal.label,'fixed')" :title="tableHVal.label">
                                    {{tableHVal.label}}
                                </span>
                                  <div v-if="tableHVal.isFilter" class="tableHeadFilter" >
                                    <i class="triangle-up" title="升序" @click.stop="tableSort('asc',tableHVal,key,$event,tableHVal.search)" ref="tableSortAsc"></i>
                                    <i class="triangle-down" title="降序" @click.stop="tableSort('desc',tableHVal,key,$event,tableHVal.search)" ref="tableSortDesc"></i>
                                </div>
                            </div>
                            <span v-if="!tableHVal.colspan" class="headRight" @mousedown="mousedown(tableH,key, $event)"></span>
                          </th>
                      </tr>
                   </thead>
                </table>
              </div>
              <div class="wrap-scroll" id="fixed_cont">
                <div class="wrap-table-body" @mouseover="mouseoverFun('left')" @scroll="loadMore($event, 'left')" @contextmenu.prevent="contextmenuShow" ref="tableFixedBody" id="tableFixedBody">
                  <table class="fixed-wid-table" :style="{height: contentHeight}" id="fixed_wid_table">
                    <tbody id="fix_wid_tbody">
                    <tr v-for="(tableR,tableRInd) in tableRowData" @click="addBg(tableRInd)" :key="tableRInd">
                      <td v-for="(tableHVal,key,indx) in tableHeader[tableHeader.length-1]"
                          :key="key" 
                          v-if="!tableR.trIsHide&&tableHVal.fixed&& !(hiddenColumn.split(',').indexOf(key)>-1)"
                          v-show="!(cols10 && key==='operation') "
                          :align="tableHVal.align?tableHVal.align:'center'"
                          :class="tableHVal.align?tableHVal.align:'center'"
                          :data-cr="JSON.stringify(tableRInd)+','+key+','+tableR.id+','+tableR.numB+','+indx">
                        <!-- 操作 -->
                        <div v-if="key==='operation'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                          <span  :class="{iconGroup:caseEntranceFlag}">
                            <img class="operation-icon operationHover" src="/static/img/operation.png" alt="" @click.stop="operationFun($event,tableR,tableHVal)">
                            <!--需要直接点击案列右边栏-->
                            <template v-if="tableR.xlsCaseInfoList">
                                <template v-if="sheetName=='无形-土地' && tableR.ruleType=='11' && tableR.xlsCaseInfoList.length>0">
                                  <i class="case-icon" :class="{actived:tableR.xlsCaseInfoList[0].enableSheetName!=''}" @click="showCase($event,tableR)">案</i>
                                </template>
                                <template v-else v-for="caseItem in tableR.xlsCaseInfoList">
                                  <template v-if="caseItem.ruleType==1">
                                      <!--之前是显示成、收、市图标，现在全部修改成案，但是感觉后期会改过来o(*￣︶￣*)o-->
                                      <!-- <i class="case-icon" :class="{actived:caseItem.enableSheetName!=''}" @click="showCasePanel(tableR,caseItem.ruleType)">成</i> -->
                                      <i class="case-icon" :class="{actived:caseItem.enableSheetName!=''}" @click="showCasePanel(tableR,caseItem.ruleType)">案</i>
                                  </template>
                                  <template v-if="caseItem.ruleType==2">
                                      <i class="case-icon" :class="{actived:caseItem.enableSheetName!=''}" @click="showCasePanel(tableR,caseItem.ruleType)">案</i>
                                  </template>
                                  <template v-if="caseItem.ruleType==3">
                                      <i class="case-icon" :class="{actived:caseItem.enableSheetName!=''}" @click="showCasePanel(tableR,caseItem.ruleType)">案</i>
                                  </template>
                                  <template v-if="caseItem.ruleType==5">
                                      <i class="case-icon" :class="{actived:caseItem.enableSheetName!=''}" @click="showCasePanel(tableR,caseItem.ruleType)">案</i>
                                  </template>
                                </template>
                            </template>
                          </span>
                        </div>
                        <!-- 单选 -->
                        <div v-else-if="key==='check'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                          <el-checkbox v-model="tableR[key]" @change="checkedFn(tableR[key],tableR)" :disabled="!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1"></el-checkbox>
                        </div>
                        <!-- 序号 -->
                        <div v-else-if="key==='numB'" class="cell" :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}">
                          {{tableR[key]}}
                        </div>
                        <div v-else class="cell"
                            :style="{'width':tableHVal.width?tableHVal.width+'px':'','min-width':tableHVal.minWidth?tableHVal.minWidth+'px':''}"
                            :class="{checkedBlueCell:checkedBgObj.id==tableR.id&&checkedBgObj.key==key&&tableR[key]!=''}"
                            @contextmenu.stop.prevent="sign($event,tableR,key,tableRInd,'mid')" @click="setCheckedBG($event,tableR,key,tableRInd)" >
                          <div v-if="tableHVal.selected">
                            <!-- 土地案例弹窗 -->
                            <el-popover v-if="sheetName=='无形-土地'" width="162" trigger="manual" v-model="selectListOne[tableRInd]">
                              <template>
                                <ul class="land-select-list">
                                  <li v-for="(item,ruleIndex) in tableHVal.search.rule" @click="blurInp(tableR,key,$event,tableRInd,'作价规则')" :key="ruleIndex" class="fs13 pointer height34" :class="{'actived':item.value == tableR[key]}" :id="item.value" v-if="item.label != '案例作价'">{{item.label}}</li>
                                </ul>
                                <el-popover placement="right" width="162" trigger="manual" @show="activedFlag=true" v-model="selectListTwo[tableRInd]">
                                  <el-checkbox-group v-model="casePricing" class="case-pricing-list">
                                    <el-checkbox v-for="(caseItem,caseInd) in casePricingList" :key="caseInd" :label="caseItem"></el-checkbox>
                                  </el-checkbox-group>
                                  <div class="text-center marginTop8">
                                    <a class="darkBlue fs13 pointer" @click="addClandValuetionref(tableR,key,tableRInd)">确定</a>
                                    <a class="orange fs13 pointer marginLeft10" @click="selectListOne[tableRInd]=false;selectListTwo[tableRInd]=false;activedFlag=false;casePricingFlag=false;">取消</a>
                                  </div>
                                  <el-button class="padding0 pointer case-pricing-btn fs13 text-left" @click="openCaseMenuList(tableR,tableRInd)" :class="{'actived':activedFlag || tableR[key] == 11}" type="text" slot="reference">案例作价</el-button>
                                </el-popover>
                                <el-button type="text" class="select-case-pricing padding0 pointer fs13" @click="openLandMenuList(tableRInd)" :disabled="tableR.id==''||!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1  || cols10 || (customDisplay && customDisplay.disabled)" slot="reference" :title="filterCasePricing(tableR)">{{filterCasePricing(tableR)}}<i class="el-icon-arrow-down el-icon--right"></i></el-button>
                              </template>
                            </el-popover>
                            <!-- 其他sheet页弹窗 -->
                            <el-select v-else v-model="tableR[key]" :disabled="tableR.id==''||!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)" @change="blurInp(tableR,key,$event,tableRInd,'作价规则')" :class="{isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}" :ref="'select'+tableR.numB+key" @focus="selectMenuDown(tableR,key)">
                              <el-option
                                v-for="item in tableHVal.search.rule"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                          </div>
                         <el-select v-else-if="tableHVal.isSelect" v-model="tableR[key]"  @change="blurInp(tableR,key,$event,tableRInd,'是否进口')" :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"
                                    :class="{isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}"
                                     filterable
                                     @paste.native.capture.prevent="pasteFromExcel($event,tableR,key,tableRInd,tableHVal,indx)">
                                         <el-option
                                            v-for="item in tableHVal.options"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                        </el-option>
                                    </el-select>
                          <el-date-picker v-else-if="tableHVal.search && tableHVal.search.inputType=='date'"  v-model="tableR[key]" type="date" placeholder="选择日期"
                                          format="yyyy/MM/dd"
                                          value-format="yyyy/MM/dd"
                                          :editable="$store.state.readonly||!cols10"
                                          :clearable="false"
                                          :ref="'date' + key + tableRInd"
                                          @focus="selectDatePicker(key, tableRInd)"
                                          :disabled="!$store.state.readonly || $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"
                                          @input="blurInp(tableR,key,$event,tableRInd,1,tableHVal)"
                                          @paste.native.capture.prevent="pasteFromExcel($event,tableR,key,tableRInd,tableHVal,indx)"
                                          :class="{isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1)}">
                          </el-date-picker>
                          <el-date-picker v-else-if="tableHVal.search && tableHVal.search.inputType=='year'" v-model="value5" type="year" placeholder="选择年" :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"></el-date-picker>
                          <el-input
                            v-else
                            v-model="tableR[key]"
                            @keyup.native="keyupInp($event,tableR,key)"
                            @blur="blurInp(tableR,key,$event,tableRInd,'',tableHVal)"
                            @focus="focusInp(tableR,key,$event)"
                            :class="{isWarning:tableR[key]=='#N/A',
                                    isMarked:(tableR['columnNames'].split(',')).indexOf(key)>-1,
                                    isPasted:(tableR.paste&&pasteCloum.indexOf(key)>-1),
                                    isDrag:tableR.drag==key,
                                    isMoved:(tableR.moveCloum&&indx>=endTDMin&&indx<=endTDMax&&dragDec=='横向')||
                                            (tableR.moveCloum&&tableR.moveCloum==key&&tableR.numB>=endTDMin&&tableR.numB<=endTDMax&&dragDec=='纵向')}"
                            :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1 || cols10 || (customDisplay && customDisplay.disabled)"
                            @paste.native.capture.prevent="pasteFromExcel($event,tableR,key,tableRInd,tableHVal,indx)"
                            :data-cr="JSON.stringify(tableRInd)+','+key+','+tableR.id+','+tableR.numB+','+indx">
                          </el-input>
                        </div>
                        <!--拖拽的标点-->
                        <div class="drag-peg"
                              v-if="tableR.drag==key&&tableR.id"
                              @mousedown.stop="tdMousedown(tableRInd,key,$event,tableR.id,tableR.numB,indx)"
                              :data-cr="JSON.stringify(tableRInd)+','+key+','+tableR.id+','+tableR.numB+','+indx">
                        </div>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            <!--固定列 end-->
            <!--底部合计 begin-->
            <div class="table-footer">
              <div  ref="tableFoot" @scroll="scrollFoot" class="tableTotal table-scroll-x"   :class="{balanceTableFd:sheetName=='资产负债表',noTopBorder:sheetName=='利润表'||sheetName=='审定数'}">
                <table>
                    <tbody>
                        <tr v-for="(tableT,tableTInd) in totalData" :key="tableTInd">
                            <td v-for="(tableH,key) in tableHeader[tableHeader.length-1]"
                                v-if="!(hiddenColumn.split(',').indexOf(key)>-1)"
                                v-show="!(cols10 && key==='operation')"
                                 :key="key" 
                                 :align="tableH.align?tableH.align:'center'" 
                                 :class="tableH.align?tableH.align:'center'">
                                <div class="cell" :style="{'width':tableH.width?tableH.width+'px':'','min-width':tableH.minWidth?tableH.minWidth+'px':''}">
                                    <template v-if="tableH.footLabel">
                                        <span v-if="tableH.footLabel[tableTInd+'']=='合计'" class="t-ellipsis">
                                          {{tableH.footLabel[tableTInd]}}(共{{totalNum}}条已入库)
                                        </span>
                                        <span v-else class="t-ellipsis">{{tableH.footLabel[tableTInd]}}</span>
                                    </template>
                                    <template v-else>
                                      <div  @contextmenu.prevent="sign($event,tableT,key,tableTInd,'botm')"
                                            v-if="!(key=='operation' || key=='check' || key=='numB') && !(tableTInd==0 || tableTInd==totalData.length-1)">
                                        <el-input  v-model="tableT[key]"
                                          @keyup.native="keyupInp"
                                          @blur="blurInp(tableT,key,$event,tableTInd,'','',true)"
                                          @focus="focusInp(tableT,key,$event)"
                                          :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1"
                                          :class="{isWarning:tableT[key]=='#N/A',isMarked:(tableT['columnNames'].split(',')).indexOf(key)>-1}"></el-input>
                                      </div>
                                      <span v-else class="pr5 t-ellipsis">{{tableT[key]}}</span>
                                  </template>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
              </div>
              <!--固定的列 begin-->
              <div class="tableTotal fixed-table-taotal" v-if="sheetName!='利润表'&&sheetName!='资产负债表'&&sheetName!='审定数'">
                <table>
                  <tbody>
                    <tr v-for="(tableT,tableTInd) in totalData" :key="tableTInd">
                      <td v-for="(tableH,key) in tableHeader[tableHeader.length-1]" 
                          v-show="!(cols10 && key==='operation')" 
                          :key="key" :align="tableH.align?tableH.align:'center'" 
                          :class="tableH.align?tableH.align:'center'"
                          v-if="tableH.fixed&&!(hiddenColumn.split(',').indexOf(key)>-1)">
                        <div class="cell" :style="{'width':tableH.width?tableH.width+'px':'','min-width':tableH.minWidth?tableH.minWidth+'px':''}">
                            <template v-if="tableH.footLabel">
                                <span v-if="tableH.footLabel[tableTInd+'']=='合计'" class="t-ellipsis" :title="`${tableH.footLabel[tableTInd]}(共${totalNum}条已入库`">
                                  {{tableH.footLabel[tableTInd]}}(共{{totalNum}}条已入库)
                                </span>
                                <span v-else class="t-ellipsis" :title="tableH.footLabel[tableTInd]">{{tableH.footLabel[tableTInd]}}</span>
                            </template>
                            <template v-else>
                              <div  @contextmenu.prevent="sign($event,tableT,key,tableTInd,'botm')"
                                    v-if="!(key=='operation' || key=='check' || key=='numB') && !(tableTInd==0 || tableTInd==totalData.length-1)">
                                 <el-input  v-model="tableT[key]"
                                  @keyup.native="keyupInp"
                                  @blur="blurInp(tableT,key,$event,tableTInd,'','',true)"
                                  @focus="focusInp(tableT,key,$event)"
                                  :disabled="!$store.state.readonly ||  $store.state.notOperableSheetNames.indexOf(sheetName)>-1"
                                  :class="{isWarning:tableT[key]=='#N/A',isMarked:(tableT['columnNames'].split(',')).indexOf(key)>-1}"></el-input>
                              </div>
                              <span v-else class="pr5 t-ellipsis" >{{tableT[key]}}</span>
                            </template>
                        </div>
                      </td>
                    </tr>
                  </tbody>
               </table>
              </div>
              <!--固定的列 end-->
            </div>
            <!--底部合计 end-->
        </div>
        <!-- 鼠标右键 -->
        <div class="contextmenu" ref="contextmenu" :class="{hidden:isHideMenu}">
            <ul class="right-menu-cont">
                <li @contextmenu.prevent="delRow" @click="delRow">删除</li>
                <li @contextmenu.prevent="addRow" @click="addRow()" v-if="isCheckAllFlag">插入一行</li>
                <li @contextmenu.prevent="addRow" @click="addRow(true)" v-if="isCheckAllFlag">插入多行<span class="cellNums" @click.stop="cellNumsFun"><el-input-number v-model="cellNums" controls-position="right" size="small" :min="1" :max="99"></el-input-number></span>行</li>
                <li @contextmenu.prevent="showOrHide" @click="showOrHide">批量显示与隐藏</li>
                <li>冻结到此列
                  <template>
                    <el-select class="width100" @change="freezeColumn" v-model="currentColumn" filterable placeholder="请选择">
                      <div>
                        <vue-scroll>
                          <el-option
                            v-for="item in columnArr"
                            :key="item.column"
                            :label="item.label"
                            :value="item.column">
                          </el-option>
                        </vue-scroll>
                      </div>
                    </el-select>
                  </template>
                </li>
                <li @contextmenu.prevent="removeFreeze('')" @click="removeFreeze('')">解除全部冻结</li>
                <li>跳转到此列
                   <template>
                     <el-select class="width100"
                                filterable
                                @change="jumpToColumn"
                                @focus="assembleColumn"
                                v-model="jumpColumn"
                                placeholder="请选择">
                      <div>
                        <vue-scroll>
                           <el-option-group v-for="group in joumpColumnArr" :key="group.label" :label="group.label">
                            <el-option v-for="(item,index) in group.options" :key="index" :label="item.label" :value="item.column" :disabled="item.disabled">
                            </el-option>
                          </el-option-group>
                        </vue-scroll>
                      </div>
                    </el-select>
                  </template>
                </li>
            </ul>
        </div>
        <!-- 操做弹窗 -->
        <div class="contextmenu operation" ref="operation" :class="{hidden:isHideOperation,maxWidth:caseEntranceFlag}">
            <ul>
                <li @click="fieldKC" :class='{"isdisabled":this.tableInfo.id == ""}'><i class="iconfont icon-renwu"></i>底稿</li>
                <li v-if="isShowProspecting" @click="selectPeople" :class='{"isdisabled":(this.tableInfo.id == "" || !(($store.state.isUser || $store.state.isAudit==1) && $store.state.readonly))}'><i class="iconfont icon-daiban"></i>勘察</li>
                <li v-if="isShowConfirmationRequests" @click="downLoadinquiryLetter" :class='{"isdisabled":this.tableInfo.id == ""}'><i class="iconfont icon-xunzhenghan"></i>询证函</li>
                <li v-if="caseEntranceFlag&&caseAuthorityFlag" @click="showCase" :class='{"isdisabled":tableInfo.id == ""}'><i class="iconfont icon-anlie"></i>查看评估案列</li>
            </ul>
        </div>
        <!--排序的弹窗-->
        <div class="contextmenu sort-cont" ref="sortCont" :class="{hidden:isShowSortCont}">
          <i  :class="{arrowLeft:!isLastSort,arrowRight:isLastSort}"></i>
          <ul>
            <li v-for="(value, key, index) in curSortArr" :key="index" @click="sortPop(key)" :class="{active:sheetSearchTerm.sortType==key&&sheetSearchTerm.order==arrowSort.order&&currentArrowHight}">{{value}}</li>
          </ul>
        </div>
        <!--提示的弹窗-->
        <center-dialog ref="tipsWrapper" dialogWidth='320px' dialogHeight="308px" dialogTitle="提示信息" titlePosition="left">
          <div slot="dialogContent" class="dialog-content">
            <div class="tip-content">
              您已经勾选超过100条科目了~ <br>
              您不妨试试表头的批量替换操作~
            </div>
            <img :src="require('../../static/img/tipImg.png')" >
            <div class="dialog-footer marginTop8">
              <span class="search-btn" @click="closeTips">我知道了</span>
            </div>
          </div>
        </center-dialog>
        <!--标记-->
        <div class="contextmenu sign-cont" ref="signCont" :class="{hidden:isShowSignCont}">
          <ul>
            <li @click="markCell($event)" v-if="markCellFlag">标记</li>
            <li @click="markCell($event)" v-else>取消标记</li>
          </ul>
        </div>
        <kcperson-Dialog ref="kcDialog" :tableInfo="tableInfo" :kctype="kctype"></kcperson-Dialog>
    </div>
</template>
<script>
import centerDialog from "@/components/centerDialog"
import searchModule from "@/components/searchModule";
import kcpersonDialog from "@/components/kcpersonDialog";
import pakoUtil from '@/components/tools/transferData'
const pako = new pakoUtil();
//绘制
// window.requestAnimationFrame = (function(){
//   return  window.requestAnimationFrame       ||
//           window.webkitRequestAnimationFrame ||
//           window.mozRequestAnimationFrame    ||
//           function( callback ){
//             window.setTimeout(callback, 1000 / 60);
//           };
// })();
export default {
  props: ["tableHeader", "sheetNameBool", "sheetName","nums","curSheetName","cols10","customDisplay"],
  components: {
    searchModule,
    kcpersonDialog,
    centerDialog
  },
  data() {
    return {
      iTime: "", //滚动执行定时器
      scrollLeft: 0,
      checkAll: false, //全选
      inputCont: "", //获取焦点记录输入框内容
      pageNum: 1, //当前页数
      pages: 0, //总共页数
      isHideMenu: true, //右键弹窗隐藏
      isHideOperation: true, //操作弹窗隐藏
      searchCondition: [], //搜索的集合
      searchTermStr: "", //搜索条件
      totalData: [{}], //合计
      tableRows: [], //表格数据
      rowInd: "",
      scrollBool: false, //滚动加载只执行一次
      changeFlag: true,
      tableLoadObj: {}, //所有表格加载的状态tab切换的时候不需要再次加载数据
      curSearch: "", //传入的列表头的对象
      curFiled: "", //传入列表名
      showTooltip: false, //表头的tooltip
      showTooltipFixed:false,
      toolTipStyle: {}, //tooltip的位置
      isCheckAllFlag: true, //是否没有选全选
      visibelFlag: false,
      isLastFiled: true, //最后一列
      checkedArr: [], //勾选的数据
      markData:{
        key:'',
        tableR:'',
        index:'',
        type:''
      },
      sheetSearchTerm: {
        conditions: "", //搜索的条件
        sort: "", //排序字段名称,
        order: "",//asc或desc(升序或降序)
        sortType:""//排序规则
      },
      sendParams: {
        investorId: "",
        projectId: ""
      },
      tabX:0,     //表头拖动
      mousemoveWidth:0,
      isMousemove:false,
      loadDataFlag:false, //是否进入新增、修改的接口
      groupId:'',
      initDate:{},//初始化的数据
      direction:'dn',//滚动的方西
      sortFlag:false,
      tablefootLabel:{
        "应收账款":3,
        "持有到期投资":2,
        "长期应收":3,
        "股权投资":2,
        "投资性房地产":2,
        "工程物资":2,
        "生产性生物资产":2,
        "油气资产":2,
        "商誉":2,
        "其他应收款":3,
        "预付账款":3,
        "原材料":2,
        "产成品(库存商品)":2,
        "在产品(自制半成品)":2,
        "发出商品":2,
        "工程施工":2
      },
      isShowSortCont:true,
      isShowSignCont:true,
      markCellFlag:true,
      sortList:{
        "desc":{"2":"归类降序","1":"数值降序"},
        "asc":{"2":"归类升序","1":"数值升序"},
      },
      curSortArr:{},
      arrowSort:{
         oElem:'',
         sort:'',
         order:''
      },
      currentArrowHight:false,
      isLastSort:false,
      isShowProspecting: false,  //是否显示勘查
      isShowConfirmationRequests: false, //是否显示询证函
      tableInfo: "",   //底稿取表格信息
      kctype: "tablemore",  //使用类
      totalNum:0, //合计的条数
      searchTotalNum:0,//条件查询的数量
      matchRuleType:{ //作价规则
        "账面比例作价":2,
        "成本法作价":3,
        "收盘价作价":4,
        "二手作价":5,
        "特殊作价":6,
        "股权比例作价":7,
        "收益法作价":8,
        "市场法作价":9,
        "成本法快捷版作价":10,
        "案例作价" : 11,
        "收入分成法作价":12
      },
      pasteCloum:[],//粘贴的数组
      entranceSelect:{ //进出口列
        '是':'是',
        '否':'否'
      },
      cellBG:{
        event:"",
        rowInd:"",
        cell:"",
        id:""
      },
      cellNums:1,   //插入行数
      firstShowLoading:true,//第一次加载

      isHaveMoreData:false, //是否可以向下滑动
      pageMax:0, //页面最大值
      scrollNum:0,//滚动的距离
      dataSize:600,//每页取得数据
      addTableObj:{},//页面新增的数据(单行数据)
      resultData:[], //接口返回的结果组
      mousePosition: '', // 鼠标位置
      checkedBlueCell:{ //标蓝的对象(关联的时候)
        id:'',
        key:''
      },
      divScrollTop:0,//距离滚动到顶部的位置
      resetDataFlag:false, //搜索排序的时候从初始开始加载
      curSelectRef:'',//用于处理滚动的时候 下拉框不消失的问题
      curDatePicker: '', // 用于处理滚动时，日期选择器不消失的问题
      caseType:{
        "成本法":1,
        "收益法":2,
        "市场法":3,
        "收入分成法":5
      },
      updataLoading:'',
      //caseEntranceFlag:true, //是否显示"查看评估案列"
      startTD:'',//开始的位置
      endTD:'',//结束的
      curDragIdx:'',//当前拖动的表格
      dragDec:'',//拖动的方向
      endTDMax:'',//横向的最大值
      endTDMin:'',//横向最小值
      dragMoveFlag:false,//在拖拽的过程中
      casePricing : [], //已选土地作价规则
      activedFlag : false,  //判断案例作价是否处于选中状态
      casePricingList : ['市场比较法','成本逼近法','基准地价法','剩余法','收益还原法'],
      selectListOne : {},  //土地案例下拉列表状态
      selectListTwo : Object.assign({},this.selectListOne),  //案例作价下拉列表状态
      casePricingFlag : false,   //当前是否选择的是案例作价
      casePricingIndex : 0,   //存储当前点击的tableRInd，用来关闭弹窗【无形-土地法专用】
      hiddenColumn: '', // 接收表格数据中需要隐藏的列
      currentColumn: '', // 当前冻结至的列
      columnArr: [] , // 选择冻结时，下拉框显示的列
      frozeColumn: '', // 用于存储冻结的列
      allCheckEnd: '', // 可视区域序号再加100的值
      jumpColumn:'',//跳转到此列
      joumpColumnArr:[],//跳转到列的集合
      fullHeadColum:[]//所有表头列

    };
  },
  computed:{
    //页面上显示的数据
    tableRowData(){
      return this.tableRows;
    },
    //计算表格的高度
    contentHeight() {
      return this.resultData.length * 21 + 'px';
    },
    //关联显示蓝色背景
    checkedBgObj(){
      return this.checkedBlueCell;
    },
    //当前页面是否是最大化还是最小化(flase:最小化，true:最大化)
    pageType(){
      return this.$store.state.isfixedFlag;
    },
    caseEntranceFlag(){
      var flag = false;
      let caseSheets=['房屋建筑物', '电子设备', '机器设备', '车辆', '在产品(自制半成品)', '产成品(库存商品)','无形-其他','无形-土地'];
      if(caseSheets.indexOf(this.sheetName) > -1){
        flag = true;
      }
      return flag;
    },
    caseAuthorityFlag(){
      var flag = true;

      switch (this.tableInfo.ruleType) {
        case 2:
        case 5:
        case 6:
        case 10:
          flag = false;
          break;

        default:
          break;
      }
      return flag;
    }

  },
  mounted() {
    var _this = this;
    this.$store.state.changeToThousand = this.changeToThousand;
    this.sendParams.projectId=this.$store.state.projectId;
    this.sendParams.investorId=this.$store.state.investorId || this.customDisplay.investorId;
    var groupIdArr = JSON.parse(this.$getCookie("user")).groupIds.split(',');
    this.curSortArr = this.sortList['desc'];
    if(groupIdArr[0]==''&&groupIdArr[1]){
      this.groupId = groupIdArr[1];
    }else{
       this.groupId = groupIdArr[0];
    }

    if (this.sheetNameBool) {
      this.changeFlag = false;
      this.getSheetData();
	    this.reckonHg();
    }
    this.$store.state.tableHgFn = _this.reckonHg;
    document.addEventListener(
      "click",
      function() {
        _this.showTooltip = false;
        _this.showTooltipFixed = false;
        _this.isShowSortCont = true;
        _this.isHideOperation = true;
        _this.isShowSignCont = true;
        //需要将粘贴的数据清空
        _this.pasteCloum = [];
        for(var i=0;i<_this.resultData.length;i++){
          _this.$set(_this.resultData[i],'paste',false);
        }
        //土地案例关闭作价规则选择弹窗
        if(_this.sheetName=='无形-土地'){
          if(_this.selectListOne[_this.casePricingIndex]) _this.selectListOne[_this.casePricingIndex] = false;
          if(_this.selectListTwo[_this.casePricingIndex]) _this.selectListTwo[_this.casePricingIndex] = false;
        }
      },
      false
    );

    // this.openHouseCase();
    this.$store.state.addCaseIconFn = this.addCaseIconFn;
    this.$store.state.addLandCaseIconFn = this.addLandCaseIconFn;
    this.$store.state.curCaseInfo ='';

    this.$store.state.resetPageData = this.resetPageData;
    this.$store.state.getSheetData = this.getSheetData;
    this.$store.state.getTotalNum = this.getTotalNum;
    this.$store.state.UpdateCaseRow = this.updateCaseRow;
    document.body.ondragstart = function() {return false};
    this.$store.state.controlColumnShow = this.controlColumnShow;
  },
  methods: {
    // 土地案例作价规则过滤
    filterCasePricing (tableR){   //土地案例选中内容过滤
      switch(tableR.ruleType){
        case 2:
          return "账面比例作价";
          break;
        case 6:
          return '特殊作价';
          break;
        case 11:
          return tableR.landRuleType;
        default:
          break;
      }
    },
    //去除冒泡
    cellNumsFun(){},
    //单元格加选中背景
    setCheckedBG(event,tableR,key,index){
      if(!this.customDisplay || !this.customDisplay.checkedBG) return;
      var id=tableR.id,val=tableR[key];
      if(this.cellBG.id!=id || this.cellBG.cell!=key ){
        if(this.cellBG.event){
          this.cellBG.event.target.style="";
        }
        this.cellBG.event=event;
        this.cellBG.rowInd=index;
        this.cellBG.cell=key;
        this.cellBG.id=id;
        // if(val != ''){
        //   event.target.style="background:#3A80EC!important;color:#fff;"
        // }
        this.$store.state.CheckedTable={
          tableName:this.$store.state.curSheetName,
          id:id,
          val:val,
          key:key,
          type:3
        }
        this.$set(this.checkedBlueCell,'id',id);
        this.$set(this.checkedBlueCell,'key',key);

      }else{

      }
    },
    /*查看评估案列*/
    showCase(ev,tableR){
      var _this = this;
      //var checkArr = this.getChecked();
      // if (checkArr.length === 0) {
      //   this.$messageError("请选择一条数据");
      //   return;
      // }
      // if (checkArr.length!=1) {
      //   this.$messageError("只能勾选一条数据查看评估案列");
      //   return;
      // }
      // if (!checkArr[0].id) {
      //   this.$messageError("请不要勾选空栏");
      //   return;
      // }
      if(this.sheetName == '无形-土地'){
        this.$store.state.caseDataId = tableR&&tableR.id || this.tableInfo.id;
        this.$store.state.curCaseInfo = tableR || this.tableInfo;
        this.$http.post('/api/clandXlsData/initClandXlsData',{
          projectId: this.$store.state.projectId,
          investorId: this.$store.state.investorId,
          landId : tableR&&tableR.id || this.tableInfo.id,
          landNumber : tableR&&tableR.B || this.tableInfo.B || '',
          groundName : tableR&&tableR.C || this.tableInfo.C || '',
          constructionArea : tableR&&tableR.J || this.tableInfo.J || ''
        }).then(res=>{
          var idx = Number(this.tableInfo.numB)-1;
          this.$store.state.curCaseActiveNum = 0;
          this.$store.state.isFullpage="true";//弹框位置
          this.openHouseCase();
        }).catch(err=>{
          this.$messageError(err);
        })
      }else{
        var idx = Number(this.tableInfo.numB)-1;
        this.$store.state.caseDataId = this.tableInfo.id;
        this.$store.state.curCaseInfo = this.tableInfo;
        this.$store.state.curCaseActiveNum = 0;
        this.$store.state.isFullpage="true";//弹框位置
        this.openHouseCase();
      }
    },
    /*增加案列图标
    *type：成本法、收益法、市场法
    *enableSheetName：对应的某个tab
    *status:启用or删除
    */
    addCaseIconFn(type,enableSheetName,status){
      var arr = [];
      var _this = this;
      var type = this.caseType[type];
      var flag = false;
      var useCaseName ='';
      var checkObj,index,t;
      if(this.$store.state.curCaseInfo){
        index = Number(this.$store.state.curCaseInfo.numB)-1;
        arr = this.$store.state.curCaseInfo.xlsCaseInfoList||[];

      }else{
        checkObj = this.tableInfo;
        index = Number(checkObj.numB)-1;
        arr = checkObj.xlsCaseInfoList||[];
      }
      if(arr.length>0){
        for(var i= 0;i<arr.length;i++){
          if(arr[i].ruleType==type){
            flag = true;
            //启用or删除

            switch (status) {
              case "启用":

                 var updataArr = [];
                 //需要判断之前的数据是否有启用过案列的，如果有的话需要将其改为不启用
                 for(var j =0;j<this.resultData.length;j++){
                    for(var t =0;t<this.resultData[j].xlsCaseInfoList.length;t++){
                        if(this.resultData[j].xlsCaseInfoList[t].ruleType==type&&this.sheetName=="房屋建筑物"){
                            this.resultData[j].xlsCaseInfoList[t].enableSheetName = '';
                            updataArr = this.resultData[j].xlsCaseInfoList;
                            this.$set(this.resultData[j],"xlsCaseInfoList",updataArr);
                            this.$set(this.resultData[j],"disableColumns",_this.resultData[index].disableColumns);
                            break;
                        }
                    }
                 }

                  arr[i].enableSheetName = enableSheetName;
                  useCaseName =enableSheetName;

                break;
              case "禁用":
                 arr[i].enableSheetName = '';
                break;
              case "删除":
                //需要判断importSheetName的值
                 if(type==1){
                  arr[i].importSheetName = "成本法";
                }
                var str = arr[i].importSheetName;//初始页面的导入值
                var dataStrArr=str.split(",");  //分割成字符串数组
                var enableArr = enableSheetName.split(',');
                var curUseSheetName = arr[i].enableSheetName;

                if(enableArr.indexOf(curUseSheetName)>-1){
                    arr[i].enableSheetName ="";
                }
                for(var j = 0;j<enableArr.length;j++){
                    var idx = dataStrArr.indexOf(enableArr[j]);
                    dataStrArr.splice(idx,1);
                }

                arr[i].importSheetName = dataStrArr.join(',');
                if(arr[i].importSheetName==""){
                  arr.splice(i,1);
                }

                // if(arr[i].enableSheetName==enableSheetName){
                //    arr.splice(i,1);
                // }

                break;
                default:
                  //上传
                  var importStr = arr[i].importSheetName+','+enableSheetName;
                  var importArr = importStr.split(',');
                  var temp = []; //一个新的临时数组
                  for(var j = 0; j < importArr.length; j++){
                      if(temp.indexOf(importArr[j]) == -1){
                          temp.push(importArr[j]);
                      }
                  }
                  arr[i].importSheetName = temp.join(',');
                break;
            }
            break;
          }
        }
        //如果数组中不存在，则需要添加
        if(!flag){
          arr.push({
            "ruleType":type,
            "enableSheetName":useCaseName,
            "importSheetName":enableSheetName
          });

        }
        //需要排序(成、市、收)
        if(arr.length<2) return
        for(var i=0;i<arr.length;i++){
            for(var j=i+1;j<arr.length;j++){
                if(Number(arr[i].ruleType)>Number(arr[j].ruleType)){
                    t=arr[i];
                    arr[i]=arr[j];
                    arr[j]=t;
                }
            }
        }
        console.log(arr);
      }else{
        //不需要导入案列能直接启用案列的情况（车辆、电子设备、机器设备）
        //电子设备、机器设备,无形-其他可以直接启用案列
        if(status=='启用'&&this.sheetName!='房屋建筑物' && this.sheetName!='在产品(自制半成品)' && this.sheetName!='产成品(库存商品)'){
            arr.push({
                "ruleType":type,
                "enableSheetName":enableSheetName,
                "importSheetName":enableSheetName
              });
        }else{
           arr.push({
              "ruleType":type,
              "enableSheetName":'',
              "importSheetName":enableSheetName
            });
        }

      }
       this.$set(this.resultData[index],"xlsCaseInfoList",arr);
       this.$store.state.curCaseInfo = this.resultData[index];
    },
    // 土地案例添加图标 status:0【禁用】  1【启用】  2【删除】
    addLandCaseIconFn(status){
      switch(status){
        case '0':
          this.$store.state.curCaseInfo.xlsCaseInfoList[0].enableSheetName = '';
          break;
        case '1':
          if(typeof this.$store.state.curCaseInfo == 'string') this.$store.state.curCaseInfo = [];
          this.$set(this.$store.state.curCaseInfo,'xlsCaseInfoList',[{
            "enableSheetName":this.sheetName,
          }])
          break;
        case '2':
          this.$store.state.curCaseInfo.xlsCaseInfoList = [];
          break;
      }
    },
    /*查看具体案列*/
    showCasePanel(tableR,type){
      switch (type) {
        case 1:
        //成本法
          this.$store.state.caseTabItem = "costLaw";
          this.$store.state.curCaseActiveNum = 0;
          break;
        case 2:
        //收益法
          this.$store.state.caseTabItem = "incomeLaw"
          this.$store.state.curCaseActiveNum = 1;
          break;
        case 3:
        //市场法
          this.$store.state.caseTabItem = "marketLaw"
          this.$store.state.curCaseActiveNum = 2;
          break;
        default:
          break;
      }
      this.openHouseCase();
      this.$store.state.curCaseInfo = tableR;
      this.$store.state.caseDataId = tableR.id;
    },
    /*案列右侧栏*/
    openHouseCase(){
      var _this  = this;
      this.$store.commit("changeShowCommon");
      this.$store.state.commonTitle = "评估案例";
      this.$store.state.componentsType = "caseMain";
      this.$store.state.cprWidth = true;
      this.$store.state.isFullpage=true; // 控制右侧弹窗的位置
    },
    selectMenuDown(tableR,key){
      this.curSelectRef = "select"+tableR.numB+""+key;
      this.isHideMenu = true;
      this.isHideOperation = true;
      this.retractPopverFn();
      console.log(key);
      console.log(tableR.numB+""+key);
    },

    // 表格中日期选择器函数
    selectDatePicker(key, index) {
      console.log(key, index, 111111);
      this.curDatePicker = 'date' + key + index;
    },

    //表头拖动
    mousedown(row,key,event){
      if(this.$refs.tabToolTip) this.$refs.tabToolTip.cancel();
      var _this=this;
      this.isMousemove=true;
      this.tabX=event.x;
      this.mousemoveKey=key;
      this.normalKey = ['operation','check','numB'];
      if(this.tableHeader.length>1){
        this.mousemoveRow=this.tableHeader[this.tableHeader.length-1];
      }else{
        this.mousemoveRow=row;
      }
      if(!this.mousemoveRow[this.mousemoveKey].width){
          this.$set(this.mousemoveRow[this.mousemoveKey],"width",this.mousemoveRow[this.mousemoveKey].minWidth);
        if(this.sheetName!='资产负债表'&&this.sheetName!='利润表'&&this.sheetName!='审定数'&&this.normalKey.indexOf(key)<0){
          console.log('1');
          this.$set(this.mousemoveRow[this.mousemoveKey],"minWidth",88);
        }


      }
      this.mousemoveWidth=this.mousemoveRow[this.mousemoveKey].width;
      document.onmouseup=function () {
        _this.isMousemove=false;
       // if(_this.mousemoveRow[_this.mousemoveKey].width) _this.mousemoveRow[_this.mousemoveKey].width = '';

      }
    },
    mousemove(event){
      var _this = this;
      if(!this.isMousemove){return}
      // console.log(this.mousemoveRow[this.mousemoveKey].minWidth)
      // console.log(this.mousemoveRow[this.mousemoveKey].width+(event.x-this.tabX))
      // console.log(this.mousemoveRow[this.mousemoveKey].minWidth<=(this.mousemoveRow[this.mousemoveKey].width+(event.x-this.tabX)))
      if(this.mousemoveRow[this.mousemoveKey].minWidth<=(this.mousemoveRow[this.mousemoveKey].width+(event.x-this.tabX))){
        if(this.tableHeader.length>1 && this.tableHeader[0][this.mousemoveKey]){
          this.$set(this.tableHeader[0][this.mousemoveKey],"width",this.mousemoveWidth+(event.x-this.tabX))
          this.$set(this.mousemoveRow[this.mousemoveKey],"width",this.mousemoveWidth+(event.x-this.tabX))
        }else{
          this.$set(this.mousemoveRow[this.mousemoveKey],"width",this.mousemoveWidth+(event.x-this.tabX))
        }
      }else{
        if(this.normalKey.indexOf(this.mousemoveKey)>-1||this.sheetName=='资产负债表'||this.sheetName=='利润表'||this.sheetName=='审定数'){
            if(this.tableHeader.length>1 && this.tableHeader[0][this.mousemoveKey]){
                this.$set(this.tableHeader[0][this.mousemoveKey],"width",this.tableHeader[0][this.mousemoveKey].minWidth)
                this.$set(this.mousemoveRow[this.mousemoveKey],"width",this.mousemoveRow[this.mousemoveKey].minWidth)
              }else{
                this.$set(this.mousemoveRow[this.mousemoveKey],"width",this.mousemoveRow[this.mousemoveKey].minWidth)
              }
            return
        }else{
          if(this.tableHeader.length>1 && this.tableHeader[0][this.mousemoveKey]){
                this.$set(this.tableHeader[0][this.mousemoveKey],"minWidth",88);
                this.$set(this.tableHeader[1][this.mousemoveKey],"minWidth",88)
                this.$set(this.tableHeader[0][this.mousemoveKey],"width",88)
                this.$set(this.mousemoveRow[this.mousemoveKey],"width",88)
              }else{
                this.$set(this.mousemoveRow[this.mousemoveKey],"width",88)

              }
        }

      }

    },
    /*点击表头的toolTip*/
    popup(data, key, event, name,fixed) {
      var _this = this;
      this.isHideMenu = true;
      this.retractPopverFn();
      //当再次点击表头的时候tab要恢复初始的样子
      if (this.$refs.tabToolTip) {
        this.$refs.tabToolTip.cancel();
      }
      //如果没有search的数据的话不需要创建pop
      if (!data.search) return;
      var wrapW = $('.wrap-table-body').outerWidth()
      var el = event.currentTarget;
      var els =286-$(el).outerWidth()
      var left = el.parentNode.parentNode.offsetLeft+23;
      var top = el.parentNode.parentNode.offsetTop;
      var oH = el.parentNode.parentNode.offsetHeight;
      var lastTop = "";
      if (top == 0) {
        lastTop = el.parentNode.parentNode.offsetHeight+3;
      }
      if (oH >= 50) {
        lastTop = 44;
      }
      if (top > 0 && top < 30 && oH > 0) {
        lastTop = 59;
      }
      this.isLastFiled = false;
      //如果是最后一列
      if (data.search.last) {
        left = left - 120;
        this.isLastFiled = true;
      }
      //固定列不需要减去滚动的距离
      if(!data.fixed){
        left = left-Number(this.$refs.tableHead.scrollLeft);
      }
      //
      if(left+286>wrapW){
           this.isLastFiled = true;
           left = left-els;
      }
      this.toolTipStyle = {
        left: left + "px",
        top: lastTop + "px"
      };

      //  console.log(data);
      //需要创建tooltip
      this.curSearch = data.search;
      this.curFiled = key;
      if(fixed){
        this.showTooltipFixed = true;
      }else{
        this.showTooltip = true;
      }

    },
    //文件成功之后
    uploadSuccess(response, file, fileList) {
      this.loading.close();
    },
    uploadError(err, file, fileList) {
    },
    beforeUpload(file) {
      this.loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        fullscreen: true,
        background: "rgba(0, 0, 0, 0.6)"
      });
    },
    //右键
    contextmenuShow(e, del) {
     if(this.cols10) return;
     if(this.customDisplay && this.customDisplay.disoperation) return;
     if(!this.$store.state.readonly) return;
     if(this.sheetName=='利润表'||this.sheetName=='资产负债表'||this.sheetName=='审定数') return;
      var _this = this,
          curWid =  $('.wrap-table-body').outerWidth(),
          curHig =  $('.wrap-table-body').outerHeight(),
          xDis = e.x,
          yDis = e.y;
      this.isHideOperation = true;
      this.isHideMenu = false;
      this.cellNums=1;
      this.$nextTick(()=>{
         var oElmHig = this.$refs.contextmenu.clientHeight;
         this.$store.state.widFlag!='1'?curWid:curWid=curWid+400;
          if(curWid-xDis>=202){
            this.$refs.contextmenu.style.left = xDis + "px";
          }else{
            this.$refs.contextmenu.style.left = xDis-220+"px";
          }
          if(curHig-yDis>=oElmHig){
            this.$refs.contextmenu.style.top = yDis + "px";
          }else{
            this.$refs.contextmenu.style.top = yDis-oElmHig+"px";
          }


      })
      if (del) {
          this.isCheckAllFlag = false;
        } else {
          this.isCheckAllFlag = true;
        }

      document.addEventListener("click", handler, false);
      function handler() {
        _this.isHideMenu = true;
        document.removeEventListener("click", handler, false);
      }
    },
    //操作
    operationFun(e, tableR, tableHVal) {
      //土地案例关闭作价规则选择弹窗
      if(this.sheetName=='无形-土地'){
        this.selectListOne[this.casePricingIndex] = false;
        this.selectListTwo[this.casePricingIndex] = false;
      }
      this.tableInfo = tableR;
      var _this = this;
      tableHVal.prospecting === true ? (this.isShowProspecting = true) : (this.isShowProspecting = false);
      tableHVal.confirmationRequests === true ? (this.isShowConfirmationRequests = true) : (this.isShowConfirmationRequests = false);
      this.isHideOperation = false;
      this.$refs.operation.style.left = e.x+12 + "px";
      this.$refs.operation.style.top = e.y + "px";
      //document.addEventListener("click", operaHandler, false);
      // function operaHandler(event) {
      //   if (event.target != e.target) {
      //     _this.isHideOperation = true;
      //   document.removeEventListener("click", operaHandler, false);
      //   }
      // }



    },
    // 操作--底稿
    fieldKC() {
      //英文大写
      var fieldKCY = this.getKCNameFn(this.tableInfo.sheetName);
      this.$store.commit("changeShowCommon");
      this.$store.state.commonTitle = "工作底稿详情";
      this.$store.state.commonBtn = "";
      this.$store.state.componentsType = "spotTaskInfo"; //现场勘查
      this.$store.state.isFullpage="true";//弹框位置
      this.$store.state.dataObj = {
        listType : "manuscript",
        dataTRInfo: this.tableInfo,
        fieldKCY: fieldKCY
      };
    },
    //操作 -- 判断sheetName对应的英文大写
    getKCNameFn(str){
      switch(str){
        case "现金":
          return "CASHCHECK"
          break;
        case "银行存款":
          return "BANKREGULATION"
          break;
        case "应收账款":
        case "预付账款":
        case "其他应收款":
          return "CREDITOR"
          break;
        case "材料采购(在途物资)":
        case "原材料":
        case "在库周转材料":
        case "委托加工物资":
        case "产成品(库存商品)":
        case "在产品(自制半成品)":
        case "发出商品":
        case "在用周转材料":
        case "农产品":
        case "消耗性生物资产":
        case "工程施工":
          return "INVENTORY"
          break;
        case "房屋建筑物":
        case "投资性房地产":
          return "HOUSE"
          break;
        case "构筑物":
        case "管道沟槽":
          return "STRUCTURE"
          break;
        case "土地":
        case "无形-土地":
          return "PARCELSTATUS"
          break;
        case "机器设备":
          return "GENERALEQUIPMENT"
          break;
        case "车辆":
          return "VEHICLE"
          break;
        case "电子设备":
          return "LARGEQUIPMENT"
          break;
      }
    },
    //操作--勘察
    selectPeople() {
      this.$store.state.kcseleName = this.getKCNameFn(this.tableInfo.sheetName);
      this.$refs.kcDialog.openDialog();
    },
    // 操作--询证函
    downLoadinquiryLetter() {
      var _this = this;
      this.$http
        .post("/api/confirmationletter/downConfirmationLetter", {
          xlsId: this.tableInfo.id,
          projectId: this.tableInfo.projectId,
          investorId: this.tableInfo.investorId,
        })
        .then(function(data) {
          window.location.href = data.data;
        })
        .catch(function(error) {
          _this.$messageError(error);
        });
    },
    //插入行
    addRow(more) {
      if(this.sheetName=='利润表'||this.sheetName=='资产负债表'||this.sheetName=='审定数') return;
      var checkArr = this.getChecked(),
         index,indexNum,
        _this = this;
      if(more){
        if (this.resultData.length==0) {
          for (let i = 0; i < _this.cellNums; i++) {
            var addRowObj = Object.assign({},_this.initData);
            addRowObj.sort = '';
            addRowObj.numB = i+1;
            addRowObj.check = false;
            _this.resultData.splice(i, 0, addRowObj);
          }
        }else{
          if (checkArr.length === 0) {
            this.$messageError("请选择一条数据");
            return;
          }
          index = this.resultData.indexOf(checkArr[checkArr.length - 1]);
          indexNum = this.resultData[index].numB+1;
          for (let i = index+1; i < _this.cellNums+index+1; i++) {
            var addRowObj = Object.assign({},_this.initData);
            addRowObj.sort = '';
            addRowObj.numB = indexNum++;
            addRowObj.check = false;
            _this.resultData.splice(i, 0, addRowObj);
          }
          for(var i = _this.cellNums+index+1;i<this.resultData.length;i++){
            var orderNum = this.resultData[i].numB+_this.cellNums;
            this.$set(this.resultData[i], "numB", orderNum);
          }
        }
         _this.renewVisibleData(_this.divScrollTop);
      }else{
        //当页面没有数据的时候
        var addRowObj = Object.assign({},this.initData);
        this.checkAll = false;
        if (this.resultData.length==0) {
          var idx = this.resultData.length;
          addRowObj.sort = '';
          addRowObj.numB = 1; //序号
          addRowObj.check = false;
          //this.resultData[idx] = addRowObj;
          _this.resultData.splice(0, 0, addRowObj);
          this.renewVisibleData(_this.divScrollTop);
          this.$forceUpdate();
          return;
        }

        if (checkArr.length === 0) {
          this.$messageError("请选择一条数据");
          return;
        }
        index = this.resultData.indexOf(checkArr[checkArr.length - 1]);
        // if (checkArr[checkArr.length - 1]["ruleType"]) {
        //   addRowObj.ruleType = "";
        //   addRowObj.disableColumns = "";
        // }
        addRowObj.sort = '';
        addRowObj.numB = Number(this.resultData[index].numB)+1;
        addRowObj.check = false;
        this.resultData.splice(index+1, 0, addRowObj);
        console.log(_this.resultData);
        for(var i = index + 2;i<this.resultData.length;i++){
          var orderNum = this.resultData[i].numB+1;
          this.$set(this.resultData[i], "numB", orderNum);
        }
         this.renewVisibleData(_this.divScrollTop);
      }

    },
    //删除
    delRow() {
      var _this = this;
      var checkArr = this.getChecked();
      if (checkArr.length === 0) {
        this.$messageError("请选择一条数据");
        return;
      }
      //需要判断是不是全选
      var ids = "";
      if (!this.isCheckAllFlag || this.checkAll) {
        //ALL,sheetName,projectId,investorId
        // ids =
        //   "ALL" +
        //   "," +
        //   this.sheetName +
        //   "," +
        //   this.sendParams.projectId +
        //   "," +
        //   this.sendParams.investorId +
        //   ",";
        ids = '全选';
      } else {
        for (var i = 0; i < checkArr.length; i++) {
          var index = this.resultData.indexOf(checkArr[i]);
          if(checkArr[i].id!=''){
            ids += checkArr[i].id + ",";
          }

          this.resultData.splice(index, 1);
        }
      }

      //需要请求接口
      if(ids!='全选'){ids = ids.substring(0, ids.length - 1);}
      this.deletData(ids);
     // var orderNum
      for (var i = 0; i < this.resultData.length; i++) {
        this.$set(this.resultData[i], "check", false);
        this.$set(this.resultData[i], "numB", i+1);
      }
      this.checkAll = false;
      this.$nextTick(()=>{
        // if(this.resultData.length===0){
        //   this.addRow();
        // }else
        if(this.resultData[this.resultData.length-1]&&this.resultData[this.resultData.length-1].id&&!this.isHaveMoreData){
          var addRowObj = Object.assign({},this.initData);
          var idx = this.resultData.length-1;
          // if(idx<=0){
          //   addRowObj.sort = 8;
          //   addRowObj.numB = idx+1; //序号
          //   this.resultData[idx] = addRowObj;
          // }else{
          //   addRowObj.sort = this.resultData[idx-1].sort;
          //   addRowObj.numB = idx+1; //序号
          //   this.resultData[idx] = addRowObj;
          // }



        }
      })
      this.$forceUpdate();
      if(ids!='全选'){
         this.renewVisibleData(_this.divScrollTop);
      }

    },
    //判断是否有选择checked
    checkFun() {
      if (
        this.lookupKey(this.tableHeader[this.tableHeader.length - 1], "check")
      ) {
        this.setCheck(false);
      }
    },
    setCheck(checkBool) {
      //如果是全选(全选的是当前页的数据)
      if(checkBool){
        for (var i = 0; i < this.tableRows.length; i++) {
          this.$set(this.tableRows[i], "check", checkBool);
          for(var j = 0;j<this.resultData.length;j++){
            if(this.tableRows[i].id==this.resultData.id){
              this.$set(this.resultData[i], "check", checkBool);
            }
          }
        }

      }else{
        for (var i = 0; i < this.resultData.length; i++) {
          this.$set(this.resultData[i], "check", checkBool);
        }
      }


    },
    //获取多选选项
    getChecked() {
      var checkArr = [];
      for (var i = 0; i < this.resultData.length; i++) {
        if (this.resultData[i].check === true) {
          checkArr.push(this.resultData[i]);
        }
      }
      this.checkedArr = checkArr;
      //console.log(checkArr);
      return checkArr;
    },
    hideToolTip() {
      this.showTooltip = false;
      this.showTooltipFixed = false;
    },
    //表头搜索
    searchCallback(data) {
      var _this = this;
      var flag = true;
      switch (data.type) {
        case "input":
          break;
        case "select":
          break;
        case "checkbox":
          break;
        case "range":
          if (data.value1 == "" && data.value2 == "") flag = false;
          if(data.keyWorld) flag = true;
          break;
        case "selectInput":
          if (!data.value) flag = false;
          if(data.keyWorld) flag = true;
          break;
        case "tab":
          if (
            data.value1 == "" &&
            data.value2 == "" &&
            data.activeTab == "first" &&
            data.lable != "作价规则"
          )
            flag = false;
          break;
        case "selectSingle":
         if(data.value==''){
           flag = false;
         }
         if(data.keyWorld || data.keyWorld == 0) flag = true;
          break;
      }
      if (
        data.label == "作价规则" &&
        data.activeTab == "first" &&
        data.ruleArr.length <= 0
      ) {
        this.$messageError("搜索项不能为空!");
        return;
      }
      if (!flag&&data.type=='selectSingle'){
        this.$messageError("搜索项不能为空!");
        return;
      }
      if (!flag) {
        this.$messageError("输入项不能为空哦!");
        return;
      }
      //如果是tab2点击的确定
      if (data.type == "tab" && data.activeTab == "second") {
        this.batchProcess(data);
        return;
      }
      if (data.type != "tab" && data.activeTab == "second") {
        this.batchProcess(data);
        return;
      }
      //作价规则的 ruleStr(需求改变，多选改单选，泪~~~~)
      var ruleStr = "";
      if (data.label == "作价规则" && data.activeTab == "first") {
        ruleStr =data.ruleArr;
      }

      //需要筛选条件
      this.searchCondition.push(setData(data));
      function setData(data) {
        for (var i = 0; i < _this.searchCondition.length; i++) {
          if (
            _this.searchCondition[i].filedType == "selectInput" &&
            _this.searchCondition[i].name == data.title &&
            _this.searchCondition[i].filed == data.filed
          ) {
            _this.searchCondition.splice(i, 1);
          }
          if (
            _this.searchCondition[i] &&
            _this.searchCondition[i].filedType == "range" &&
            _this.searchCondition[i].filed == data.filed
          ) {
            if (
              _this.searchCondition[i].vaule1 == data.vaule1 &&
              _this.searchCondition[i].vaule2 == data.vaule2 &&
              _this.searchCondition[i].name1 == data.title1 &&
              _this.searchCondition[i].name2 == data.title2 &&
              _this.searchCondition[i].toolTipCurName != "作价规则"
            ) {
              _this.searchCondition.splice(i, 1);
            }
          }
          /**作价规则 */
          if (
            _this.searchCondition[i] &&
            _this.searchCondition[i].toolTipCurName == "作价规则" &&
            _this.searchCondition[i].ruleStr == ruleStr
          ) {
            _this.searchCondition.splice(i, 1);
          }
          /*单选 */
          if( _this.searchCondition[i]&& _this.searchCondition[i].filedType=="selectSingle"&&_this.searchCondition[i].value==data.value){
             _this.searchCondition.splice(i, 1);
          }


        }


        if (data.type == "selectInput") {
          return {
            toolTipCurName: data.label,
            name: data.title,
            condition: data.value,
            filed: data.filed, //列名
            sheetName: _this.sheetName,
            filedType: data.type
          };
        }
        if (
          data.type == "range" ||
          (data.type == "tab" &&
            data.activeTab == "first" &&
            data.label != "作价规则")
        ) {
          return {
            toolTipCurName: data.label, //表头的名称
            name1: data.title1, //
            name2: data.title2,
            value1: data.value1,
            value2: data.value2,
            filed: data.filed, //列名
            sheetName: _this.sheetName, //科目名称
            filedType: data.type, //表头类型
            activeTab: data.activeTab || "" //当前的tab
          };
        }
        if (data.label == "作价规则" && data.activeTab == "first") {
          return {
            filedType: data.type, //表头类型
            activeTab: data.activeTab || "", //当前的tab
            toolTipCurName: data.label, //表头的名称
            ruleStr: ruleStr,
            filed: data.filed, //列名
            ruleArr: data.ruleArr //规则
          };
        };
      if(data.type=="selectSingle"){
          return{
            filed:data.filed,
            filedType:data.type,
            value:data.value,
            toolTipCurName:data.label
          }
        };
      }
      this.hideToolTip();
      this.$nextTick(function(){
        _this.reckonHg();
        console.log(_this.$refs.searchCondition.offsetHeight);
      })
     //this.reckonHg();

    },
    //从第一页开始查询
    resetPageData(){
        this.pageNum=1;
        this.resultData = [];
        this.tableRows = [];
        this.pageMax = 0;
        this.curDragIdx ='';
        this.dataSize = 600;
        this.firstShowLoading = true;
        this.resetDataFlag = false;
        this.$refs.tableScroll.scrollTop = 0;
        this.sortFlag = true;
    },
    //搜索条件删除
    searchDel(item) {
      var _this = this;
      this.searchCondition.splice(this.searchCondition.indexOf(item), 1);
      if (this.searchCondition.length == 0) {
        this.sheetSearchTerm.conditions = "";
        this.resetPageData();

        this.getSheetData();
        this.$nextTick(function(){
          _this.reckonHg();
        })

      }
    },
    //全选
    checkAllFun() {
      // this.setCheck(this.checkAll);
      this.checkedItems(this.checkAll)
    },
    //设置存活disabled
    setDisabled(tableR,key){
      var _this=this;
      if(_this.sheetName==="在产品(自制半成品)"){
        if(tableR.ruleType!="9" && ["W","X","Y","Z","AA","AB","AC","AD","AE","AF"].indexOf(key)>-1) return true
      }else if(_this.sheetName==="产成品(库存商品)"){
        if(tableR.ruleType!="9" && ["X","Y","Z","AA","AB","AC","AD","AE","AF"].indexOf(key)>-1) return true
      }else if(_this.sheetName==="无形-土地"){
        if(tableR.ruleType===11 && ["O"].indexOf(key)>-1) return true
      }else{
        return false;
      };
    },
    //案例存货（在产品，产成品）单独处理
    saveInventoryCase(id,key,value,type){
      var _this=this,params = {
          dataId: id,
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          xlsSheet: _this.sheetName,
          groupId:_this.groupId,
          property:key,
          value:value,
          showLoading: false
        };
        params.conditions = type ? this.sheetSearchTerm.conditions : ''
      if(_this.sheetName==="在产品(自制半成品)"){
        if(["W","X","Y","Z","AA","AB","AC","AD","AE","AF","M"].indexOf(key)===-1) return
      }else if(_this.sheetName==="产成品(库存商品)"){
        if(["X","Y","Z","AA","AB","AC","AD","AE","AF","M"].indexOf(key)===-1) return
      }else{
        return
      };
      _this.$http
        .get("/api/inventoryCase/saveCaseAll", {params})
        .then(function(data) {})
        .catch(function(error) {
          _this.$messageError(error);
        });
    },
    //土地案例作价规则下拉菜单
    openLandMenuList(tableRInd){
      //土地案例关闭作价规则选择弹窗
      event.stopPropagation();
      this.selectListOne[this.casePricingIndex] = false;
      this.casePricingIndex = tableRInd;
      this.selectListOne[tableRInd] = true;
      if(this.selectListTwo[tableRInd]) this.selectListTwo[tableRInd] = false;
      this.activedFlag=false;
      this.casePricingFlag=false;
    },
    // 案例作价下拉菜单
    openCaseMenuList(tableR,tableRInd){
      this.selectListTwo[tableRInd] = true;
      this.casePricingFlag = true;
      this.casePricing = tableR['landRuleType']!='' ? tableR['landRuleType'].split(',') : [];
    },
    // 土地案例作价规则多选提交
    addClandValuetionref(tableR,key,index){
      if(this.casePricing.length == 0){
        this.$messageError("请选择案例作价");
        return;
      }
      this.$store.state.curCaseInfo = tableR;
      this.$http.post('/api/clandValuationRef/addClandValuetionref',{
        projectId: this.$store.state.projectId,
        investorId: this.$store.state.investorId,
        landId : tableR.id,
        groupId : this.groupId,
        landList : JSON.stringify(this.casePricing),
        landNumber : tableR.B,
        groundName : tableR.C,
        constructionArea : tableR.J,
      }).then(res=>{
        this.$store.state.UpdateCaseRow(res.data);
        this.selectListOne[index] = false;
        this.selectListTwo[index] = false;
      }).catch(err=>{
        this.$messageError(err);
      })
    },
    //输入框失去焦点
    blurInp(tableR, key, event, idx, type, tableHVal, isTotal) {
      if(this.sheetName=='无形-土地' && key == 'ruleType'){
        if(!this.casePricingFlag){
          tableR['ruleType'] = event.target.id;
          this.selectListOne[this.casePricingIndex] = false;
        }
      }
      //输入框到达边距的时候错位的问题
      var keyupScrollLeft = this.$refs.tableBody.parentNode.scrollLeft;
      var _this = this;
      if (!type) event.target.style = "";
      if(this.loadDataFlag||this.dragMoveFlag) return;
      if (keyupScrollLeft !== 0) {
        this.scrollLeft += keyupScrollLeft;
        if (
          this.scrollLeft >
         $('.wrap-table-body').outerWidth() -
            this.$refs.tableBody.parentNode.offsetWidth
        ) {
          this.scrollLeft =
           $('.wrap-table-body').outerWidth() -
            this.$refs.tableBody.parentNode.offsetWidth;
        }
        this.$refs.tableHead.scrollLeft=  this.scrollLeft;
        this.$refs.tableBody.style.left = "-" + this.scrollLeft + "px";
        this.$refs.tableFoot.scrollLeft = this.scrollLeft;
        this.$refs.tableBody.parentNode.scrollLeft = 0;
      }
      if (tableHVal) {
        this.limits(tableHVal, tableR, key);
      }

      if(key!="ruleType"){
         tableR[key] =tableR[key].replace(/\s+/g, "");
      }

      if (this.inputCont!= tableR[key]) {
        //调用接口
        //需要判断是修改还是新增的数据

        if (tableR.id) {
          this.updataTable(tableR.id, key, tableR[key], null, idx, isTotal);
        } else {
          var sort='';
          var numB= Number(tableR.numB)-1;//序号
          for(var i = numB;i>=0;i--){
            if(this.resultData[i]&&this.resultData[i].sort){
              sort = this.resultData[i].sort+1;
              break;
            }
          }
          if(sort=='') sort=1;
          this.insertData(key, tableR[key], tableR, sort, idx);
        }
      }
    },
    //输入框获取焦点
    focusInp(tableR, key, event) {
      //土地案例关闭作价规则选择弹窗
      if(this.sheetName=='无形-土地'){
        this.selectListOne[this.casePricingIndex] = false;
        this.selectListTwo[this.casePricingIndex] = false;
      }
      var _this = this ;
     if(this.loadDataFlag||this.dragMoveFlag){
        event.target.blur();
       return;
     };

      event.target.style = "border:1px solid #88C6FF;background:#fff";
      if(key!="ruleType"){
         this.inputCont = ''+tableR[key].replace(/\s+/g, "");
      }

      //拖拽
      //  console.log(tableR);
      //  console.log(event.target.classList);
      //  console.log(event.target.dataset.cr);
      //  console.log(event.target.parentNode.parentNode.nextElementSibling);

      // if(event.target.parentNode.parentNode.nextElementSibling.className.indexOf('drag-peg')>-1){
      //    event.target.parentNode.parentNode.nextElementSibling.classList.remove('hidden');
      // }
      //先去掉别的drag字段
      if(String(this.curDragIdx)==''){
         this.curDragIdx = tableR.numB-1;
      }else{
        if(!this.resultData[this.curDragIdx]) return;
        this.$set(this.resultData[this.curDragIdx],'drag','');
      }
      console.log(event);
      //加入字段(用于拖拽)显示拖拽的列
      this.$set(this.resultData[tableR.numB-1],'drag',key);
      this.curDragIdx = tableR.numB-1;
       console.log(_this.curDragIdx);
      //储存字段
    },
    //当还在请求的阶段 tab禁止
    disableTab(){
      var _this = this;
      document.onkeydown = function() {
        if (event.keyCode == 9&& _this.loadDataFlag) {
            return false;
        } 
      }
    },
    keyupInp(event,tableR,key) {
      //输入框到达边距的时候错位的问题
      // var keyupScrollLeft = this.$refs.tableBody.parentNode.scrollLeft;
      // var _this = this;
      // if (keyupScrollLeft !== 0) {
      //   this.scrollLeft += keyupScrollLeft;
      //   if (
      //     this.scrollLeft >
      //     this.$refs.tableBody.offsetWidth -
      //       this.$refs.tableBody.parentNode.offsetWidth
      //   ) {
      //     this.scrollLeft =
      //       this.$refs.tableBody.offsetWidth -
      //       this.$refs.tableBody.parentNode.offsetWidth;
      //   }
      //   this.$refs.tableHead.scrollLeft =  this.scrollLeft ;
      //   this.$refs.tableBody.style.left = "-" + this.scrollLeft + "px";
      //   this.$refs.tableFoot.scrollLeft = this.scrollLeft;
      //   this.$refs.tableBody.parentNode.scrollLeft = 0;
      // }
      if(tableR){
        var curVal = tableR[key].replace(/\s+/g, "");
        if(this.inputCont!=curVal){
          if(!this.resultData[this.curDragIdx]) return;
           this.$set(this.resultData[this.curDragIdx],'drag','');
        }else{
          if(!this.resultData[this.curDragIdx]) return;
          this.$set(this.resultData[this.curDragIdx],'drag',key);
        }
      }



    },
    //-5到5的系数
    limits(tableHVal, tableR, key) {
      if (tableHVal.limits) {
        var value = tableR[key];
        if (!value) return "";
        if (
          typeof (value - 1) !== "number" ||
          !/^-?[1-9]\d*$/.test(parseInt(value))
        ) {
          _this.$messageWarning("请输入整数");
          tableR[key] = this.inputCont;
          return;
        }
        if (value >= -5 && value <= 5) {
          return;
        } else {
          _this.$messageWarning("请输入-5到5的整数");
          tableR[key] = this.inputCont;
          return;
        }
      }
    },
    //添加tr样式
    addBg(index) {
      this.$refs.tableBody.childNodes[0].childNodes[index].className =
        "is-selected";
      this.$refs.tableFixedBody.childNodes[0].childNodes[0].childNodes[index].className = "is-selected";
      if (this.rowInd !== "" && this.rowInd != index&&this.$refs.tableBody.childNodes[0].childNodes[this.rowInd]) {
        this.$refs.tableBody.childNodes[0].childNodes[this.rowInd].className = "";
        this.$refs.tableFixedBody.childNodes[0].childNodes[0].childNodes[this.rowInd].className = '';
      }
      this.rowInd = index;
    },

    mouseoverFun(type) {
      if(this.mousePosition==type) return;
      this.mousePosition = type;
    },

    loadMore(event, type){
      if(this.mousePosition !== type) return

      var _this = this,
        scrollLeft = event.target.scrollLeft,
        scrollTop = event.target.scrollTop,
        scrollHeight = event.target.scrollHeight,
        clientHeight = event.target.clientHeight;
      // if(scrollTop+ clientHeight == scrollHeight){
      //   this.$refs.tableFixedBody.scrollTop = this.$refs.tableScroll.scrollTop;
      //   return
      // }
      $('input').blur();
      this.retractPopverFn();
      if(this.curDragIdx&&this.resultData[this.curDragIdx]) this.$set(this.resultData[this.curDragIdx],'drag','');

      var obj = {
        "select":this.curSelectRef,
        "datePicker": this.curDatePicker,
      }
     // console.log(this.$refs[obj["select"]]);
      if(this.$refs[obj["select"]]&&this.$refs[obj["select"]][0]){
         this.$refs[obj["select"]][0].blur()
      }
      if(this.$refs[obj['datePicker']] && this.$refs[obj['datePicker']][0]) {
        this.$refs[obj['datePicker']][0].handleClose();
      }
      // 滚动时，清除选中的样式
      if(this.rowInd) {
        if(this.$refs.tableBody.childNodes[0]&&this.$refs.tableBody.childNodes[0].childNodes[this.rowInd]) this.$refs.tableBody.childNodes[0].childNodes[this.rowInd].className = "";
        if(this.$refs.tableFixedBody.childNodes[0]&&this.$refs.tableFixedBody.childNodes[0].childNodes[0]&&
          this.$refs.tableFixedBody.childNodes[0].childNodes[0].childNodes[this.rowInd]
        ) this.$refs.tableFixedBody.childNodes[0].childNodes[0].childNodes[this.rowInd].className = '';

      }
      if(this.mousePosition == 'right'){
        this.$refs.tableFixedBody.scrollTop = scrollTop;
      }else {
        this.$refs.tableScroll.scrollTop = scrollTop;
      }
      this.divScrollTop = scrollTop;
      // if(this.resetDataFlag){

      //   this.resetDataFlag = true;
      // }

      	_this.renewVisibleData(scrollTop);

      if(this.scrollBool) return;
      if(this.sortFlag) return;
      if (!this.isHideMenu) {
        this.isHideMenu = true;
      } //右键弹窗隐藏
      if (!this.isHideOperation) {
        this.isHideOperation = true;
      }

      //需要判断是否还可以往下滚动
     if (this.isHaveMoreData){
          this.scrollBool = true;
          this.dataSize = 600;
          this.direction = 'dn';
          this.firstShowLoading = false;
          this.getSheetData(function() {
            _this.scrollBool = false;
            _this.pageNum++;
            // _this.setCheck(false);
          });
        }else{
           // _this.setCheck(false);
           // _this.checkAll = false;
        }
    },
    //横向滚动条
    scrollFoot(event) {
      this.scrollLeft = event.target.scrollLeft;
      this.$refs.tableHead.scrollLeft =  this.scrollLeft;
      this.$refs.tableBody.style.left = "-" + this.scrollLeft + "px";
      this.isShowSortCont = true;
      this.showTooltip = false;
      this.showTooltipFixed = false;
    },
    //查找对象内是否有某个key
    lookupKey(obj, key) {
      for (let k in obj) {
        if (key === k) {
          return true;
        }
      }
      return false;
    },
     //防止用户操作过于频繁
    throttleFn(fn,wait){
      let previous = 0, timer = null;
       return function(...args){
          let now = +new Date();
          if(now-previous<wait){
              if(timer) clearTimeout(timer);
              timer = setTimeout(()=>{
                  previous = now;
                  fn.apply(this, args);
              },wait)
          }else{
              previous = now;
              fn.apply(this, args);
          }
      }
    },
    /**转换作价规则 */
    changePriceRule(data) {
      var priceRule = {
        '账面比例作价': "2", //作价规则
        '成本法作价': "3",
        '收盘价作价': "4",
        '二手作价': "5",
        '特殊作价': "6",
        "股权比例作价":"7",
        "收益法作价":"8",
        "市场法作价":"9",
        "收入分成法作价":"12"
      };
      return priceRule[data];
    },
    /**拼接收索条件 */
    getSearchTerm(data) {
      if (!data) return;
      if (data.filedType == "selectInput") {
        this.sheetSearchTerm.conditions +=
          data.filed + "~" + data.name + "~" + data.condition + "^";
      }
      if (
        data.filedType == "range" ||
        (data.filedType == "tab" &&
          data.toolTipCurName != "作价规则" &&
          data.activeTab == "first")
      ) {
        if (data.value1 != "" && data.value2 != "") {
          this.sheetSearchTerm.conditions +=
            data.filed +
            "~" +
            data.name1 +
            "~" +
            data.value1 +
            "^" +
            data.filed +
            "~" +
            data.name2 +
            "~" +
            data.value2 +
            "^";
        }
        if (data.value1 != "" && data.value2 == "") {
          this.sheetSearchTerm.conditions +=
            data.filed + "~" + data.name1 + "~" + data.value1 + "^";
        }
        if (data.value1 == "" && data.value2 != "") {
          this.sheetSearchTerm.conditions +=
            data.filed + "~" + data.name2 + "~" + data.value2 + "^";
        }
      }
      if (data.toolTipCurName == "作价规则") {
        this.sheetSearchTerm.conditions +=
          data.filed +
          "~" +
          "包含" +
          "~" +
          this.changePriceRule(data.ruleArr) +
          "^";
        /*for (var i = 0; i < data.ruleArr.length; i++) {
            业务修改了，由原来的多选更改为单选
        }*/
      };
      if(data.toolTipCurName=="是否进口"){
        //参数修改
        var param = {"是":"是","否":"否"}
        this.sheetSearchTerm.conditions +=  data.filed +"~"+"包含"+"~"+param[data.value]+"^";
      }
    },
    /**更新数据
     * scrollTop:向上滚动的高度
     * itemHeight:tr单个的高度
     * mainId:需要滚动的id
     * viceId:需要同时滚动的id
     * tableRows:截取的data
     * resultData:总共获取的数据
    */
    renewVisibleData(scrollTop){
      this.itemHeight = 21;
      if(!document.getElementById('tableExampleContent')) {
          this.tableRows = this.resultData;
          return
      }
      var _this = this;
      var obj = this.$store.state.renewVisibleData(scrollTop,this.itemHeight,'tableExampleScroll');
      //console.log(obj)
      var start = Number(obj.start);
      var end = Number(obj.end)+1;
      this.throttleFn(()=>{
          this.tableRows = this.resultData.slice(start, end);
          if(this.checkAll) this.checkAll = this.setCheckAll()
        },200)();
      this.$forceUpdate();
      // console.log(start * this.itemHeight); //偏移尺寸
       // 把可见区域的 top 设置为起始元素在整个列表中的位置（使用 transform 是为了更好的性能）
     // document.getElementById('tableExampleContent').style["webkitTransform"]  = `translate3d(0, ${ start * this.itemHeight }px, 0)`;
      $('#fixed_wid_table tbody,#tableExampleContent').css({
        'webkitTransform':'translate3d(0,' +start *this.itemHeight+'px, 0)',
        'mozTransform':'translate3d(0,' +start *this.itemHeight+'px, 0)',
        'transform':'translate3d(0,' +start *this.itemHeight+'px, 0)'
      });

    },
    /**
     * 获取列表数据
     * @param callback回调函数
     * @param type 条件查询
     * @param reload 修改后刷新
     * @param operation  往数据池添加数据
     */
    getSheetData(callback, type,reload,top) {
      var _this = this;
      var onlyCase = false;
      //条件查询
      if (type) {
        this.sheetSearchTerm.conditions = "";
        for (var i = 0; i < this.searchCondition.length; i++) {
          this.getSearchTerm(_this.searchCondition[i]);
        }
        this.sheetSearchTerm.conditions = this.sheetSearchTerm.conditions.substring(
          0,
          this.sheetSearchTerm.conditions.length - 1
        );
      }
      if(this.caseEntranceFlag&&this.$store.state.caseTxt=="显示全部"){
           onlyCase = true;
      }else{
          onlyCase = false;
      }
      this.$http
        .post("/api/xlsUpdateData/getBaseSheet", {
          //page: this.pageNum,
          type:this.direction,//up or dn
          limit:this.pageMax, //页面最大值
          dataSize:this.dataSize, // 每页条数
          sheetName: _this.sheetName,
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          conditions: _this.sheetSearchTerm.conditions || "",
          sort: _this.sheetSearchTerm.sort || "", //排序字段名称,
          order: _this.sheetSearchTerm.order || "", //asc或desc(升序或降序)
          sortType:_this.sheetSearchTerm.sortType||"",
          showLoading:_this.firstShowLoading,
          onlyCase:onlyCase
        })
        .then(function(data) {


          var pageData =pako.strToJson(pako.punzipMsgSTR(data.data));
          //console.log(pageData);
         // pageData.pages = 6;
          _this.isHaveMoreData = pageData.moreData; //是否有向下滚的数据
          _this.pageMax += pageData.dataList.length;
          _this.hiddenColumn = pageData.hiddenColumn ? pageData.hiddenColumn : _this.hiddenColumn
          _this.frozeColumn = pageData.freezeColumn ? pageData.freezeColumn : _this.frozeColumn
          _this.getFreezeColumn(_this.frozeColumn)
          _this.handleHeadColspan(_this.tableHeader)
          _this.handleTableHead()
          if(_this.sheetSearchTerm.conditions==''){
            _this.totalNum = pageData.dataCount;
            _this.searchTotalNum = 0;
          }else{
            //保存条件查询结果的数量
            _this.searchTotalNum = pageData.dataCount;
          }
          _this.sortFlag = false;
          var tableHeader= _this.tableHeader[_this.tableHeader.length-1];
          for(var i =0;i<pageData.dataList.length;i++){
          	for(var item in tableHeader){
              if(tableHeader[item].search&&tableHeader[item].search.inputType&&tableHeader[item].search.inputType=="date"&&
              !/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(pageData.dataList[i][item])){
          			pageData.dataList[i][item]='';
              }
              //判断时候是千分列，需要转换数据
              if(tableHeader[item].isThousands){
                if(!(pageData.dataList[i][item]==="" || pageData.dataList[i][item]==="0")){
                  pageData.dataList[i][item] = _this.$store.state.commafyNumber(pageData.dataList[i][item]);
                }
              }else if(tableHeader[item].isThousandsFour){
                if(!(pageData.dataList[i][item]==="" || pageData.dataList[i][item]==="0")){
                  pageData.dataList[i][item] = _this.$store.state.commafyNumber(pageData.dataList[i][item],4);
                }
              }
            }
             pageData.dataList[i].disableColumns=_this.addDisableColumnsFn(pageData.dataList[i].ruleType,pageData.dataList[i].disableColumns);
          }
          if (_this.firstShowLoading) {
            //增加序号(首次进入序号需要从1开始)
            for(var i =0;i<pageData.dataList.length;i++){
              pageData.dataList[i].numB = i+1;
            };
            if(pageData.totalRow!=''){
              pageData.totalRow = _this.changeToThousand(pageData.totalRow);
            } else if(_this.sheetName ==="资产负债表") {
              let totalRowArr = [];
              totalRowArr.push(pageData.initData);
              pageData.totalRow = totalRowArr;
            }
            pageData.initData.check = false;
            //第一次请求的时候才会返回
            _this.initData = pageData.initData;
            _this.addTableObj = Object.assign({},_this.initData);
            //第一次请求的时候才会返回
            _this.totalData = pageData.totalRow;
            _this.resultData = pageData.dataList;
          } else {
              switch (_this.direction) {
                  case 'dn':
                    if(!_this.resultData[_this.resultData.length-1]) return;
                      var lastOrderNum =  _this.resultData[_this.resultData.length-1].numB;
                      for(var i =0;i<pageData.dataList.length;i++){
                        var order = lastOrderNum +=1;
                        pageData.dataList[i].numB = order;
                      };
                      _this.resultData =  _this.resultData.concat(pageData.dataList);
                      if (_this.checkAll) {
                        _this.setResultDataCheck(_this.checkAll)
                      }
                    break;
              }
          }
          if(!_this.cols10){
            _this.$parent.updateSheetState(_this.sheetName,_this.totalNum);
          }
          //需要添加sort
          if(_this.sheetName!="审定数"&&_this.sheetName!="资产负债表"&&_this.sheetName!="利润表"){
            if( !_this.isHaveMoreData && !_this.cols10&&_this.resultData.length>=1&&_this.resultData[_this.resultData.length-1].id!=''){
               _this.addTableObj.numB = _this.resultData[ _this.resultData.length-1].numB+1;
               _this.addTableObj.sort ='';
               _this.resultData.push(_this.addTableObj);
              //_this.checkAll = false;
            }
            //没有数据的时候添加一条默认的数据
             if( _this.resultData.length==0 && !_this.cols10){
               _this.addTableObj.sort ='';
               _this.addTableObj.numB =1;
               _this.resultData.push(_this.addTableObj);
            }
          }
          // if(_this.tableRows.length==pageData.total){
          //   if(_this.tableRows.length==0){
          //     addRowObj.sort =1;
          //     addRowObj.numB =1;
          //     _this.tableRows.push( addRowObj);
          //   }else{
          //      addRowObj.numB = _this.tableRows[_this.tableRows.length-1].numB+1;
          //      _this.tableRows.push( addRowObj);
          //      _this.checkAll = false;
          //   }
          // }
          if (_this.totalData.length === 0) {
            _this.totalData=[{}]
            _this.$refs.tableFoot.childNodes[0].style.width =
              _this.$refs.tableHead.childNodes[0].offsetWidth + "px";
          }
          _this.resultData.length == 0
            ? (_this.visibelFlag = true)
            : (_this.visibelFlag = false);
          //如果是修改需要刷新的 需要将勾选的去掉
          if(reload) {
            _this.setCheck(false);
            _this.checkAll = false;
          }
          if(_this.firstShowLoading){
            _this.renewVisibleData();
            _this.setCheck(false);
            _this.checkAll = false;
          }
          callback && callback();
        })
        .catch(function(error) {
          _this.$messageError(error);
        });
    },
    //删除数据
    deletData(id) {
      var _this = this;
      var str = '';
      var totArr = [];
      var reloadDataflag = false;
     if(id=='') return;
     if(id!='全选'){
      var arr=id.split(',');
        for(var i =0;i<arr.length;i++){
          if(arr[i]!=''){
            break;
          }
        };
     }
     this.$parent.getUploadStatu(function(){
       _this.$http
        .post("/api/xlsUpdateData/deleteData", {
          ids: id=="全选"?'':id,
          userId:JSON.parse(_this.$getCookie("user")).id,
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          conditions:_this.sheetSearchTerm.conditions,
          sheetName: _this.sheetName,
          groupId: _this.groupId
        })
        .then(function(data) {
           // _this.$messageSuccess("操作成功")
          //如果是全选 需要清除数据
           _this.curDragIdx ='';
          if (id=='全选') {
            _this.tableRows = [];
            _this.resultData = [];
            console.log(_this.resultData.length);
            if(_this.sheetSearchTerm.conditions==''){
               _this.totalNum = 0;
            }
            if(_this.sheetSearchTerm.conditions!=''&&_this.searchTotalNum!=0){
               _this.totalNum = Number(_this.totalNum)-Number(_this.searchTotalNum);
            }
            _this.pageMax =0;
            _this.firstShowLoading = true;
            _this.isHaveMoreData = false;
            reloadDataflag = true;
            _this.$forceUpdate();
          }else{
            var len = id.split(',').length;
            reloadDataflag = true;
            _this.totalNum = Number(_this.totalNum)-Number(len);
            _this.pageMax =  _this.pageMax-Number(len);
            if( _this.pageMax<=0){
               _this.pageMax = 0;
            }
            if(_this.resultData.length<=38&&_this.isHaveMoreData){
                _this.firstShowLoading = false;
                _this.getSheetData(function(){
                 _this.renewVisibleData(_this.divScrollTop);
               },null,'reload');
            }else{
              //需要计算sort值
              var sortNum = 0;
              for(var i =0;i<_this.resultData.length;i++){
                if(_this.resultData[i].id){
                  sortNum++;
                  _this.$set(_this.resultData[i],'sort',sortNum);
                }
              }
            }
          }
          if(!reloadDataflag){
             _this.renewVisibleData(_this.divScrollTop);
             _this.$forceUpdate();
          }
          //合计
          _this.getTotalNum();
          //需要去更改状态
          _this.$parent.updateSheetState(_this.sheetName,_this.totalNum);
          _this.$parent.sendConnect();
        })
        .catch(function(error) {
          _this.$messageError(error);
        });
     },'ack')

    },
    /*
        *修改数据
        *@params id:一列id
        *  property:列名
        *  value:修改的值
        *  type:批量修改
        */
    updataTable(id, property, value, type, idx, isTotal,ratioPrice,data) {
      var _this = this;
      var params = {};
      //if((value+'').replace(/\s+/g, "")=='') return;
      var tableHeader= this.tableHeader[this.tableHeader.length-1];
       //批量修改
      if(tableHeader[property].isThousands){
         value = _this.changeToNum(value,property);
      }
      //作价规则
      if (property == "ruleType") {
        params = {
          ids: id,
          groupId: this.groupId,
          ruleType: value,
          userId:JSON.parse(_this.$getCookie("user")).id,
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          sheetName: _this.sheetName,

        };
        //如果作价规则系数调整中填写的有数据
        if(ratioPrice&&value==2){
          params.property="XS";
          params.value = ratioPrice;
        }
      } else {
        params = {
          ids: id,
          groupId: _this.groupId,
          property: property, //属性名称
          value: value,
          userId:JSON.parse(_this.$getCookie("user")).id,
          conditions: "",
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          sheetName: _this.sheetName,
        };
      }
      //如果是特殊字段的修改（费率等）
      if(data&&data.specialInitData){
        params = {
          ids: id,
          groupId: _this.groupId,
          userId:JSON.parse(_this.$getCookie("user")).id,
          conditions: "",
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          sheetName: _this.sheetName,
          specialInitData:data.specialInitData+"="+value,

        };


      }
      //批量按搜索条件修改
      if (type) {
        params.conditions = this.sheetSearchTerm.conditions;
      }
      this.disableTab();
      if(this.loadDataFlag) return;
      this.loadDataFlag = true;
      if(id!=''){
         _this.$store.state.isSavingFlag = true; // 用于控制正在保存字样的出现
         params.showLoading = false;
        this.updataLoading = this.$loading({
            lock: true,
            fullscreen: true,
            background: 'rgba(0, 0, 0, 0.2)',
          })
      }else{
         params.showLoading = true;
      }
      if(type&&id==''){this.$parent.getLoadingText('批量修改中');}
      this.$parent.getUploadStatu(function(){
          _this.$http
        .post("/api/xlsUpdateData/updateData", params)
        .then(function(data) {
          _this.saveInventoryCase(id,property,value,type);
          _this.loadDataFlag = false;
          // _this.$messageSuccess("操作成功")
           if(data.msg!='异步计算中'&&_this.sheetName!="资产负债表"&&_this.sheetName!="利润表"&&_this.sheetName!="审定数"){
            _this.$parent.sendConnect();
            _this.getTotalNum();
          }
          if (isTotal) {
            _this.getTotalNum();
          } else {
            if(_this.sheetName=="资产负债表"||_this.sheetName=="利润表"||_this.sheetName=="审定数"){
              //需要判断当前列是不是千分位
              if(_this.sheetName=="资产负债表"&&idx=='32'){
                _this.tableRows.splice(33,1,data.data[0]);
              }
               _this.$store.state.isSavingFlag = false;
               if(_this.updataLoading){
                  _this.updataLoading.close();
                  _this.updataLoading='';
              }
              _this.changeToThousand('',property,value,idx);
               _this.$parent.sendConnect();
              return;
            }
           //如果是批量修改需要重新刷新数据
            if (type) {
              if(params.ids==''&&data.msg=='异步计算中'){
                 _this.$parent.getLoadingText('批量修改中');
                 var timer = setInterval(function(){
                    _this.$parent.getUploadStatu(function(){
                        clearInterval(timer);
                        _this.resetPageData();
                         _this.getSheetData();
                         _this.$parent.sendConnect();

                    },'ack')
                  },3000)
              }else{
                //勾选的数据
                  let checkedArr = _this.getChecked();
                for(var i = 0;i<_this.checkedArr.length;i++){
                 for(var j= 0;j<data.data.length;j++){
                   if(_this.checkedArr[i].id==data.data[j].id){
                      data.data[j].check = true;
                      data.data[j].numB = _this.checkedArr[i].numB;
                      data.data[j] = _this.changeToThousand(data.data[j]);
                      data.data[j].disableColumns=_this.addDisableColumnsFn(data.data[j].ruleType,data.data[j].disableColumns);
                      //_this.tableRows.splice(i,1,data.data[j]);
                      _this.resultData.splice(data.data[j].numB-1,1,data.data[j]);
                   }
                 }
                }
                 for(var i = 0;i<_this.tableRows.length;i++){
                 for(var j= 0;j<data.data.length;j++){
                   if(_this.tableRows[i].id==data.data[j].id){
                      data.data[j].check = true;
                      data.data[j].numB = _this.tableRows[i].numB;
                      data.data[j] = _this.changeToThousand(data.data[j]);
                      data.data[j].disableColumns=_this.addDisableColumnsFn(data.data[j].ruleType,data.data[j].disableColumns);
                      _this.tableRows.splice(i,1,data.data[j]);
                   }
                 }
                }
              }
            } else {
              //如果是单个修改的
              data.data[0].check = _this.tableRows[idx].check;
              data.data[0].numB =  _this.tableRows[idx].numB;
              data.data[0] = _this.changeToThousand(data.data[0]);
              data.data[0].disableColumns=_this.addDisableColumnsFn(data.data[0].ruleType,data.data[0].disableColumns);
              _this.tableRows.splice(idx,1,data.data[0]);
              _this.resultData.splice(data.data[0].numB-1,1,data.data[0]);
              console.log(data.data[0]);
            }
          }
          _this.$store.state.isSavingFlag = false;
         if(_this.updataLoading){
           _this.updataLoading.close();
            _this.updataLoading='';
         }
        })
        .catch(function(error) {
          _this.loadDataFlag = false;
          _this.$store.state.isSavingFlag = false;
          if(_this.updataLoading){
            _this.updataLoading.close();
            _this.updataLoading='';
          }
           _this.$messageError(error);

        });
      },'ack')
    },
    /*新增数据*/
    insertData(key, value, tableR, sort, idx) {
      var _this = this;
      var obj = {};
      obj[key] = value;
      var addRowObj = Object.assign({},_this.initData);
      if(value.replace(/\s+/g, "")=='') return;
      this.disableTab();
      if(this.loadDataFlag) return;
      this.loadDataFlag = true;
      _this.$store.state.isSavingFlag = true; // 用于控制正在保存字样的出现
      value = _this.changeToNum(value,key);
      _this.$parent.getUploadStatu(function(){
        _this.$http
        .post("/api/xlsUpdateData/insertData", {
          property: key,
          value: value,
          sheetName: _this.sheetName,
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          sort: sort,
          userId: JSON.parse(_this.$getCookie("user")).id ,
          groupId: _this.groupId,
          showLoading: false
        })
        .then(function(data) {
          _this.saveInventoryCase(data.data.id,key);
        // _this.tableRows[idx] = data.data;
        // _this.$set(_this.tableRows[idx],data.data);
          data.data.check = _this.tableRows[idx].check;
          data.data.numB = _this.tableRows[idx].numB;
          data.data=_this.changeToThousand(data.data);
        // _this.tableRows.splice(idx,1,data.data);
         _this.resultData.splice(_this.tableRows[idx].numB-1,1,data.data);
         _this.loadDataFlag =false;
         // _this.$messageSuccess("操作成功");
          //需要计算sort值
          var sortNum = Number(data.data.sort);
          for(var i =Number(tableR.numB);i<_this.resultData.length;i++){
              if(_this.resultData[i].id){
                sortNum++;
                _this.$set(_this.resultData[i],'sort',sortNum);
              }
          }
          if(idx==_this.tableRows.length-1&&!_this.isHaveMoreData){
            addRowObj.sort = '';
            addRowObj.numB = _this.tableRows[_this.tableRows.length-1].numB+1;
            _this.resultData.push(addRowObj);
            _this.checkAll =false;
          };
           _this.totalNum++;
           _this.renewVisibleData(_this.divScrollTop);
           _this.$parent.updateSheetState(_this.sheetName,_this.totalNum);
           _this.getTotalNum();
          // _this.setCheck(false);
         _this.$parent.sendConnect();
          _this.$store.state.isSavingFlag = false;
        })
        .catch(function(error) {
           _this.loadDataFlag =false;
          _this.$store.state.isSavingFlag = false;
          _this.$messageError(error);
        });
      },'ack')
    },
    /*获取的合计*/
    getTotalNum() {
      var _this = this;
      this.$http
        .post("/api/xlsUpdateData/getTotalRow", {
          sheetName: _this.sheetName,
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          showLoading:false
        })
        .then(function(data) {
          if(data.data!=''){
             data.data = _this.changeToThousand(data.data);
          }
          _this.totalData = data.data;
        })
        .catch(function(error) {
          _this.$messageError(error);
        });
    },
    /*tab2执行的事件*/
    batchProcess(data) {
      var ids = "";
      switch (data.range) {
        case "全部数据":
          // ids =
          //   "ALL" +
          //   "," +
          //   this.sheetName +
          //   "," +
          //   this.sendParams.projectId +
          //   "," +
          //   this.sendParams.investorId +
          //   ",";

          break;
        case "条件查询数据":
          // ids =
          //   "CONDITION," +
          //   this.sheetName +
          //   "," +
          //   this.sendParams.projectId +
          //   "," +
          //   this.sendParams.investorId +
          //   ",";
          break;
        case "当前勾选数据":
          for (var i = 0; i < this.checkedArr.length; i++) {
            var index = this.tableRows.indexOf(this.checkedArr[i]);
            ids += this.checkedArr[i].id + ",";
          }
          ids = this.checkAll ? '' : ids.substring(0, ids.length - 1); // 若当前全选按钮被勾选，那么ids传参为空
          break;
      }
      this.updataTable(ids, data.filed, data.keyWorld, "batch",null,null,data.ratioPrice,data);
      // for (var i = 0; i < this.tableRows.length; i++) {
      //   this.$set(this.tableRows[i], "check", false);
      // }
    },
    /*排序 */
    tableSort(type, tableHVal, key, event,location) {
      //console.log(this.$refs.tableSortAsc);
      this.isShowSortCont = false;
      this.retractPopverFn();
      //如果是最后一列
      console.log(event)
      if(location.last){
        this.cols10?this.$refs.sortCont.style.left = event.x-170+ "px":this.$refs.sortCont.style.left = event.x-110+ "px";
        this.isLastSort = true;
      }else{
        this.cols10?this.$refs.sortCont.style.left = event.x -60+ "px":this.$refs.sortCont.style.left = event.x +12+ "px";
          this.isLastSort = false;
      }
      this.$refs.sortCont.style.top = event.y-8+ "px";
      this.curSortArr= this.sortList[type+''];
     // this.sortFlag = true;//不需要滚动加载
      this.arrowSort.oElem = event.target;
      //当前选中的排序
      if(event.target.style.opacity==1){
        this.currentArrowHight = true;
      }else{
        this.currentArrowHight = false;
      }
      //event.target.style.opacity = 1;
      //this.sheetSearchTerm.sort = key; //排序字段名称,
      //this.sheetSearchTerm.order = type; //asc或desc(升序或降序)
      this.arrowSort.sort = key;
      this.arrowSort.order = type;

    },
    sortPop(val){
      this.sheetSearchTerm.sortType = val;
      this.sortFlag = true;//不需要滚动加载
      for (var i = 0; i < this.$refs.tableSortAsc.length; i++) {
        this.$refs.tableSortAsc[i].style.opacity = 0.6;
        this.$refs.tableSortDesc[i].style.opacity = 0.6;
      }
      this.arrowSort.oElem.style.opacity = 1;
      this.sheetSearchTerm.sort = this.arrowSort.sort; //排序字段名称,
      this.sheetSearchTerm.order =  this.arrowSort.order; //asc或desc(升序或降序)
      this.resetPageData();
      this.getSheetData(null,null,'reload');
    },
    //选中
    checkedFn(flag,tableR){
      this.getChecked()
      if(!flag){
        this.checkAll = false;
        //需要将勾选的数据去掉
        this.$set(this.resultData[tableR.numB-1], "check", false);
        if (this.checkedArr.length >= 100) this.$refs.tipsWrapper.showDialog()
      }else{
        this.$set(this.resultData[tableR.numB-1], "check", true);
        if (this.checkedArr.length > 100) {
          this.$refs.tipsWrapper.showDialog()
          this.$set(this.resultData[tableR.numB-1], "check", false);
        }
      }
    },
    /**搜索 */
    termSearch(){
      this.resetPageData();
      this.getSheetData('','search');
    },
    //计算表格高度
    reckonHg(){
      if(this.sheetName.indexOf('汇总')!=-1) return;
      if(this.cols10){
        this.$refs.tableScroll.style.height=160+"px";
        this.$refs.tableFixedBody.style.maxHeight=160+"px";
        return
      }
       var _this = this;
       if(this.customDisplay && this.customDisplay.investorId){
         var oH = parseInt(this.customDisplay.tableHeight)-70;
       }else{
         var oH = parseInt(_this.$store.state.oElemHg)-70;
       }
      var distance =0,
          headSearchH = 0,
          tableH = this.$refs.tableHead.offsetHeight,
          len = 1;
      if(this.tablefootLabel[_this.$store.state.curSheetName]){
        len = Number(this.tablefootLabel[_this.$store.state.curSheetName])+1;
      }
      if(len>1){
        distance = (Number(len)-1)*20;
      }
      if(tableH>29){
        distance = distance+(tableH-29);
      }
      if(this.$refs.searchCondition){
      	headSearchH = this.$refs.searchCondition.offsetHeight;
      }
      //需要判断是否有滚动条
      // if(!obj.scrollWidth>obj.clientWidth||!obj.offsetWidth>obj.clientWidth){
      //   scrollBarWh = 16;
      // }
      this.$refs.tableScroll.style.height = oH-120-distance-headSearchH+26+'px';
      if(this.$refs.tableFixedBody){
         this.$refs.tableFixedBody.style.maxHeight = oH-120-distance-headSearchH+26+'px';
      }

      if(this.sheetName=="审定数"||this.sheetName=="利润表"){
        this.$refs.tableScroll.style.height = parseInt(this.$refs.tableScroll.style.height)-headSearchH+36+'px'
      }
      if(this.sheetName=="资产负债表"){
        this.$refs.tableScroll.style.height = parseInt(this.$refs.tableScroll.style.height)-headSearchH+20+'px'
      }
      //var oDivs = document.getElementsByClassName('assetBased-table');
      //  for(var i =0 ;i<oDivs.length;i++){
      //   if(oDivs[i].style.display!="none"){
      //     var searchContH = 0;
      //     searchContH = oDivs[i].querySelector('.searchCondition ').offsetHeight;
      //     oDivs[i].querySelector('.wrap-table-fixed').querySelector('.wrap-table-body').style.height= oDivs[i].querySelector('.wrap-table-body').style.height = parseInt(_this.$refs.tableScroll.style.height)-searchContH+22+'px';
      //   }
      // }

     if(!_this.firstShowLoading) _this.renewVisibleData(_this.divScrollTop);
    },
    /**
     * @params obj 新增修改的数据
     * @params column 列名
     * 新增，插入转换千分位
     *  */
    changeToThousand(obj,column,value,idx){
      var tableHeader= this.tableHeader[this.tableHeader.length-1];
      //如果是数组
      if(typeof obj=="object"&&obj.constructor==Array){
        for(var i = 0;i<obj.length;i++){
          for(var item in tableHeader){
            if(tableHeader[item].isThousands){
              if(!(obj[i][item]==="" || obj[i][item]==="0")){
                obj[i][item] = this.$store.state.commafyNumber(obj[i][item]);
              }
            }else if(tableHeader[item].isThousandsFour){
              if(!(obj[i][item]==="" || obj[i][item]==="0")){
                obj[i][item] = this.$store.state.commafyNumber(obj[i][item],4);
              }
            }
          }
        }
        return obj;
      }
      //如果是对象
      if(typeof obj=="object"&&obj.constructor==Object){
         for(var item in tableHeader){
          if(tableHeader[item].isThousands&&!isNaN(obj[item])&&obj[item]!=''){
            obj[item] = this.$store.state.commafyNumber(obj[item]);
          }else if(tableHeader[item].isThousandsFour&&!isNaN(obj[item])&&obj[item]!=''){
            obj[item] = this.$store.state.commafyNumber(obj[item],4);
          }
        }
        return obj;
      }
      //如果直接需要处理一列的话
      if(obj==''){
        if(tableHeader[column].isThousands){
          var val = this.$store.state.commafyNumber(value);
          this.$set(this.tableRows[idx],column,val);
        }else if(tableHeader[column].isThousandsFour){
          var val = this.$store.state.commafyNumber(value,4);
          this.$set(this.tableRows[idx],column,val);
        }
      }
    },
    //将千分位转为数字
    changeToNum(value,column){
      var val = value.replace(/\s+/g, "");
      var tableHeader= this.tableHeader[this.tableHeader.length-1];
      var pane = '';
      if(tableHeader[column].isThousands){
        if(val!=''){
          var numArr = String(val).split(',');
          for(var i = 0 ;i<numArr.length;i++){
            pane += numArr[i];
          }
          if(isNaN(pane)){
              pane = '';
          }
        }else{
          pane = val;
        }
        return pane;
      }else{
        return value;
      }
    },
  /**重置数据 */
   resetDate(){

    Object.assign(this.$data, this.$options.data());
    var _this = this;
    this.sendParams.projectId=this.$store.state.projectId;
    this.sendParams.investorId=this.$store.state.investorId;
    this.changeFlag = false;
    var groupIdArr = JSON.parse(this.$getCookie("user")).groupIds.split(',');
    this.curSortArr = this.sortList['desc'];
    if(groupIdArr[0]==''&&groupIdArr[1]){
      this.groupId = groupIdArr[1];
    }else{
       this.groupId = groupIdArr[0];
    }
      //console.log(_this.$options.data());
   },
   /**是否需要再次请求初始数据*/
   getSheetIfRefresh(callback){
     var _this = this;
     this.$http.post('/api/xlsUpdateData/getSheetIfRefresh',{
          projectId: _this.sendParams.projectId,
          investorId: _this.sendParams.investorId,
          sheetName: _this.sheetName
     }).then(function(res){
        if(res.data){
          _this.resetDate();
          _this.getSheetData();
        }
     }).catch(function(err){
       _this.$messageError(err);
     })
   },
   /**标记 */
   sign(event,tableR,key,index,type){
     //外审修改 需要增加标记
      var olem = event.target;
      var disOlem = olem.getAttribute('disabled');
    if(/examineModification/g.test(this.$route.path)&&tableR.id!=''){
      this.$refs.signCont.style.left = event.x + "px";
      this.$refs.signCont.style.top = event.y + "px";
      this.markData.tableR = tableR;
      this.markData.key = key;
      this.markData.index = index;
      this.markData.type = type;
      if(!disOlem){
         this.isShowSignCont = false;
         tableR['columnNames'].split(',').indexOf(key)>-1?this.markCellFlag = false:this.markCellFlag = true;
      }else{
        //模拟
        //this.isShowSignCont = false;
        //tableR['columnNames'].split(',').indexOf(key)>-1?this.markCellFlag = false:this.markCellFlag = true;
      }

    }else{
      this.contextmenuShow(event);
    }
   },
   markCell(event){
     var oStr = event.target.innerHTML;
     var _this = this;
     var markObj = {
       "取消标记":"0",
       "标记":"1"
     };
    this.$http.post("/api/xls/summary/markCell",{
      projectId:_this.sendParams.projectId,
      investorId:_this.sendParams.investorId,
      dataId:_this.markData.tableR.id,
      colName:_this.markData.key,
      status:markObj[oStr]
    }).then(function(res){
      if(oStr=="标记"){
        if(_this.markData.tableR.columnNames!=''){
          _this.markData.tableR.columnNames+=","+_this.markData.key;
         // _this.markData.tableR.columnNames = _this.markData.tableR.columnNames.substring(0, _this.markData.tableR.columnNames.length - 1);
        }else{
          _this.markData.tableR.columnNames = _this.markData.key;
        }
      }else{
        var arr =  _this.markData.tableR.columnNames.split(',');
        var idx = arr.indexOf(_this.markData.key);
        arr.splice(idx,1);
        _this.markData.tableR.columnNames =  arr.toString();
      }
      //需要判断是表身数据还是汇总数据
      if(_this.markData.type=='mid'){
        _this.$set(_this.tableRows[_this.markData.index], "columnNames", _this.markData.tableR.columnNames);
      }else{
        _this.$set(_this.totalData[_this.markData.index], "columnNames", _this.markData.tableR.columnNames);
      }
      //

    }).catch(function(err){
      _this.$messageError(err)
    })

   },
    /*粘贴 */
    pasteFromExcel(e,tableR,key,tableRInd,tableHVal,indx){
      if(!this.$store.state.readonly||this.cols10) return;
      var _this = this,tableRowSort;
      var headerClums = this.tableHeader[_this.tableHeader.length-1];
      var disableColumnArr = []; //不能编辑的列tableR.disableColumns.split(';')
      var headerArr = Object.keys(headerClums);
      var copydata = [];//拷贝数据按列名排列
      var idsArr = [];//匹配的数据的id
      var matchCloumArr = [];//获取列表的列名
      var jsonStr = '';
      this.pasteCloum = [];
      var rowNums = 0; //新增的数量
      var startNumB = tableR.numB;//粘贴开始的序号
     // console.log(headerArr);
      //console.log(_this.tableRows);
     //获取粘贴板数据
      var clipboardData = window.clipboardData || e.clipboardData, // IE || chrome
      data = clipboardData.getData('Text'),
      //判断表格数据是使用\n还是\r分行，解析成行数组
      rowArr = (data.indexOf(String.fromCharCode(10)) > -1) ?
        data.split(String.fromCharCode(10)) :
        data.split(String.fromCharCode(13)),
      //根据\t解析单元格
      cellArr = rowArr.filter(function(item) { //兼容Excel行末\n，防止粘贴出多余空行
            return (item !== "")
        }).map(function(item) {
            return item.split(String.fromCharCode(9));
        });
        //如果是个空的直接返回
        if(cellArr.length==0){
          return;
        }
       //复制单个数据
       if(cellArr.length==1&&cellArr[0].length==1){
          if(tableHVal.search.inputType=='date'&&cellArr[0][0].replace(/\s+/g, "")==''){
            return;
          }else{
            tableR[key] = cellArr[0][0].replace(/\s+/g, "");
          }
          if(tableHVal.search.inputType=='date'&&cellArr[0][0].replace(/\s+/g, "")!=''&&
            /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(cellArr[0][0].replace(/\s+/g, ""))
          ){
            tableR[key] = cellArr[0][0].replace(/\s+/g, "");
            _this.blurInp(tableR,key,e,tableRInd,'',tableHVal);
          }
        //_this.blurInp(tableR,key,e,tableRInd,'',tableHVal);
         return;
       };
        //获取匹配的id
        console.log(tableRInd);
        var cellArrInd=1;
        console.log(tableR.numB);
        console.log(_this.resultData);
        //
        for(var j = tableR.numB-1;j<cellArr.length+Number(tableR.numB-1);j++){
          if(this.resultData[j]&&this.resultData[j].id){
            //覆盖
            idsArr.push(_this.resultData[j].id);
            disableColumnArr.push(_this.resultData[j].disableColumns);
          }else{
            //新增
            idsArr.push("insert"+cellArrInd);
            cellArrInd++
          }
        };
        if(cellArrInd>1){
          var tableRowSortInd=tableR.numB;
          if(tableRowSortInd===0){
            tableRowSort=0;
          }else{
            while(tableRowSortInd>0){
              if(_this.resultData[tableRowSortInd-1].id){
                tableRowSort=_this.resultData[tableRowSortInd-1].sort;
                tableRowSortInd=0;
              }else{
                tableRowSortInd--;
                tableRowSort = 0;
              }
            }
          }
        }
        //获取粘贴的列名
        for(var n = indx;n<cellArr[0].length+indx;n++){
            matchCloumArr.push(headerArr[n]);
          }
        //处理拼接数据
        for(var i = 0;i<idsArr.length;i++){
          var obj =  copydata[i] = {};
          for(var j = 0;j<cellArr[i].length;j++){
              // console.log(matchCloumArr[j]);
              // console.log(cellArr[i][j]);

             //处理作价规则
             if(matchCloumArr[j]=='ruleType'){
               if(this.matchRuleType[cellArr[i][j].replace(/\s+/g, "")]){
                  cellArr[i][j] = this.matchRuleType[cellArr[i][j].replace(/\s+/g, "")];
               }
             }
             //千分位的需要转化
             if(headerClums[matchCloumArr[j]]&&headerClums[matchCloumArr[j]].isThousands){
               cellArr[i][j] = _this.changeToNum(cellArr[i][j].replace(/\s+/g, ""),matchCloumArr[j]);
             }
             //如果是日期的列需要转化
             if(headerClums[matchCloumArr[j]]&&headerClums[matchCloumArr[j]].search&&headerClums[matchCloumArr[j]].search.inputType=='date'){
                var dateVal = cellArr[i][j].replace(/\s+/g, "");
               if(/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(dateVal)){
                  // if(dateVal.indexOf('/')!=-1){
                  //    var dateStr = dateVal.split('/');
                  //     if(Number(dateStr[1])<10){
                  //       dateStr[1]='0'+dateStr[1];
                  //     }
                  //     if(Number(dateStr[2])<10){
                  //       dateStr[1]='0'+dateStr[2];
                  //     }
                  //     cellArr[i][j] = dateStr[0]+''+ dateStr[1]+''+dateStr[2];
                  // }
                  // if(dateVal.indexOf('-')!=-1){
                  //    var dateStr = dateVal.split('-');
                  //     if(Number(dateStr[1])<10){
                  //       dateStr[1]='0'+dateStr[1];
                  //     }
                  //     if(Number(dateStr[2])<10){
                  //       dateStr[1]='0'+dateStr[2];
                  //     }
                  //     cellArr[i][j] = dateStr[0]+''+ dateStr[1]+''+dateStr[2];
                  // }
                  cellArr[i][j]=dateVal;
               }else{
                 cellArr[i][j]='';
               }
             }
            if(headerClums[matchCloumArr[j]]){
                copydata[i][matchCloumArr[j]] = cellArr[i][j].replace(/\s+/g, "");
             }
              //进出口转换数据
             if(headerClums[matchCloumArr[j]]&&headerClums[matchCloumArr[j]].isSelect){
               copydata[i][matchCloumArr[j]] = this.entranceSelect[cellArr[i][j].replace(/\s+/g, "")];
             }


          }
        };
         //console.log(copydata);
       //console.log(matchCloumArr);
        //获取相对应的列名JSON.stringify
        var copyLen = copydata.length;
        if(copyLen>500){
          //copyLen = 500;
          this.$messageError('一次性只能粘贴500条数据哦，数据量过大可以尝试部分导入哦！');
          return;
        }
        for(var i = 0;i<copyLen;i++){
          var str = JSON.stringify(copydata[i]);
          jsonStr+= JSON.stringify(idsArr[i])+':'+str.replace(/\\n/g,"").replace(/\\r/g,"")+',';
          if(idsArr[i].indexOf('insert')!=-1){
            rowNums++;
          }
        }

        jsonStr="{"+jsonStr.substring(0,(jsonStr.length-1))+"}";
				//添加sort
				var jsonStrData = JSON.parse(jsonStr);
				if(tableRowSort){
          var tableRowSortNum;
          //需要判断当前选中的单元格是否有id
          if(tableR.id){
            tableRowSortNum = tableRowSort;
          }else{
            tableRowSortNum= tableRowSort+1;
          }
				}else{
					if(tableRInd<=0){
						var tableRowSortNum=1;
					}else{
						var tableRowSortNum=_this.tableRows[tableRInd-1].sort+1;
					}
				}
				for (let key in jsonStrData) {
					jsonStrData[key].sort=tableRowSortNum++;
				}
				jsonStr = JSON.stringify(jsonStrData);
        //e.target.blur();
        this.$parent.getUploadStatu(function(){
          _this.$http.post('/api/xlsUpdateData/updateDataList',{
            projectId: _this.sendParams.projectId,
            investorId: _this.sendParams.investorId,
            sheetName: _this.sheetName,
            groupId: _this.groupId,
            cellsAndValues:pako.changeToZip(jsonStr),
          }).then(function(data){
              //console.log(data);
            //新增数据
            if(tableRowSort!=undefined){
              for(var j= 0;j<data.data.length;j++){
                data.data[j].check = false;
                data.data[j].paste = true;
                data.data[j] = _this.changeToThousand(data.data[j]);
                data.data[j].disableColumns=_this.addDisableColumnsFn(data.data[j].ruleType,data.data[j].disableColumns);
                data.data[j].numB = startNumB+j;
                _this.resultData.splice(startNumB+j-1,1,data.data[j]);
              }
              //需要计算sort值
              var updataStartNumB =  _this.resultData[startNumB+j-2].numB;
              var updataStartSort =  _this.resultData[startNumB+j-2].sort;
               //需要修改sort值
              for(var i =updataStartNumB;i<_this.resultData.length;i++){
                if(_this.resultData[i].id){
                    updataStartSort++;
                  _this.$set(_this.resultData[i],'sort',updataStartSort);
                }
              }

            }else{
              //覆盖数据(修改)
              for(var i = 0;i<_this.resultData.length;i++){
                _this.resultData[i].paste = false;
                for(var j= 0;j<data.data.length;j++){
                  if(_this.resultData[i].id==data.data[j].id){
                    data.data[j].check = _this.resultData[i].check;
                    data.data[j].numB = _this.resultData[i].numB;
                    data.data[j].paste = true;
                    data.data[j] = _this.changeToThousand(data.data[j]);
                    data.data[j].disableColumns=_this.addDisableColumnsFn(data.data[j].ruleType,data.data[j].disableColumns);
                    _this.resultData.splice(i,1,data.data[j]);
                  }
                }
              }

            }
            if(_this.resultData[_this.resultData.length-1].id&&!_this.isHaveMoreData){
              var addRowObj = Object.assign({},_this.initData);
              addRowObj.numB=_this.resultData.length+1;
              _this.resultData.push(addRowObj)
            }
            _this.pasteCloum = matchCloumArr;
            // _this.$messageSuccess("操作成功");
            _this.inputCont = cellArr[0][0].replace(/\\n/g,"").replace(/\\r/g,"").replace(/\s+/g, "");
            _this.totalNum = Number(_this.totalNum)+rowNums;
           _this.pageMax = _this.pageMax+rowNums;
            _this.getTotalNum();
            _this.renewVisibleData(_this.divScrollTop);
            _this.$parent.sendConnect();
             _this.$parent.updateSheetState(_this.sheetName,_this.totalNum);
             //需要隐藏下拉框
           // var datePicks = document.getElementsByClassName("el-picker-panel");
            //var selDrop = document.getElementsByClassName("el-select-dropdown");
            // if(datePicks){
            //   for(var i =0;i<datePicks.length;i++){
            //     datePicks[i].style.display = 'none'
            //   }
            // }

            // if(selDrop){
            //   for(var i =0;i<selDrop.length;i++){
            //     selDrop[i].style.display = 'none'
            //   }
            // }
          }).catch(function(err){
             _this.$messageError(err);
          })
        },'ack')
    },
    /*启用案列更新当前列表的数据*/
    updateCaseRow(data) {
      let updateData = Object.assign({},data);
      updateData.check = this.$store.state.curCaseInfo.check||false;
      updateData.numB = this.$store.state.curCaseInfo.numB;
      updateData = this.changeToThousand(updateData);
      for(let i = 0; i<this.tableRows.length; i++) {
        if(this.tableRows[i]['id'] === updateData.id) {
          this.tableRows.splice(i, 1, updateData);
          break;
        }
      }
      this.resultData.splice(updateData.numB-1, 1, updateData);
      this.$store.state.curCaseInfo = updateData;
      this.$forceUpdate();
    },
    /**
     * idx：tr的idx
     * column:列名
     * e:event
     * id：当前列的id
     * numB:序号
     * itemNum：td的idx
     */
    tdMousedown(idx,column,e,id,numB,itemNum){
        console.log(idx);
        var _this = this;
        this.startTD = idx+','+column+','+id+','+numB+','+itemNum;
        this.moveArr = [];
        console.log(_this.startTD);
        this.dragMoveFlag = true;
        document.onmousemove=function(event){
           if(!_this.startTD) return;
           var event = window.event
          _this.tdMousemove(event);
        }
        document.onmouseup = function(){
          //需要判断页面是都有 拖拽的数据
          if(_this.startTD&&_this.endTD&&_this.startTD!=_this.endTD){
              var data=_this.handelDragData();
              _this.$confirm('确认拖拽复制数据么？','提示',{
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  customClass:'search-confire-box',
                  type: 'warning'
              }).then(()=>{
                  //确认
                   _this.dragRenewDataFn(data);
              }).catch(()=>{
                  //取消
                   _this.endTDMax =_this.endTDMin= null;



              })
          }
          //需要归置数据
          _this.startTD = _this.endTD = null;
         // this.dragDec = '';
          _this.dragMoveFlag = false;

        }
    },
    tdMousemove(event){
      var _this = this;
      this.startColArr = this.startTD.split(',');//起点数据
      if(event.target.dataset.cr){
        if(event.target.dataset.cr==this.endTD) return;
          this.dragDecArr  = event.target.dataset.cr.split(',');
          if(this.dragDecArr[1]=="ruleType"||this.dragDecArr[1]=="operation"||
            this.dragDecArr[1]=="check"||this.dragDecArr[1]=="numB") return
          this.endTD = event.target.dataset.cr;
      }

        //记录鼠标的方向
       if(event.target.dataset.cr&& this.startTD!=this.endTD){
          this.dragDecArr  = this.endTD.split(',');
          this.orderNum = Number(this.dragDecArr[3]-1);//全部数据的序号
          //this.$set(this.resultData[older],'moveCloum',);
          if( this.startColArr[0]==this.dragDecArr[0]){
              if(this.dragDec=='纵向'){
                 this.endTDMin = this.endTDMax = null;
                 for(var i =0;i<this.tableRows.length;i++){
                    this.$set(this.tableRows[i],'moveCloum','');
                  }
                this.$forceUpdate();

              }
              //需要清除纵向的样式
              this.dragDec = '横向';
              this.moveArr.push(this.dragDecArr[1]);
              var newArr = [...new Set(this.moveArr)];
              this.$set(this.resultData[this.orderNum],'moveCloum',newArr);
              this.endTDMin = Math.min(this.startColArr[4],this.dragDecArr[4]);
              this.endTDMax = Math.max(this.startColArr[4],this.dragDecArr[4]);
              this.$forceUpdate();
          }else if(this.startColArr[1]==this.dragDecArr[1]){
             if(this.dragDec=='横向'){
                 this.endTDMin = this.endTDMax = null;
                 this.$set(this.resultData[this.orderNum],'moveCloum','');
              }
              var moveCloum = this.startColArr[1];
              this.dragDec = '纵向';

              this.endTDMin = Math.min(this.startColArr[3],this.dragDecArr[3]);
              this.endTDMax = Math.max(this.startColArr[3],this.dragDecArr[3]);
              var rangeMin = Math.min(this.startColArr[0],this.dragDecArr[0]);
              var rangeMax = Math.max(this.startColArr[0],this.dragDecArr[0]);
              for(var i =rangeMin;i<rangeMax+1;i++){
                  this.$set(this.tableRows[i],'moveCloum',moveCloum);
              }
              this.$forceUpdate();
              //需要清除横向的样式
          }
          //console.log(event.target.classList);
          //始终记录最后一个触发的
          console.log(event.target.dataset.cr)
       }
      //如果开始与结束的坐标相等的话(清除样式)
      if(this.startTD==this.endTD) this.resetDragData();

    },
    /*归置拖拽数据 */
    resetDragData(){
      this.dragDec = '';
      this.endTDMax = this.endTDMin = null;
      for(var i =0;i<this.resultData.length;i++){
        this.$set(this.resultData[i],'moveCloum','');
      }
      this.$forceUpdate();
    },
    /**处理拖拽的数据 */
    handelDragData(){
      var _this = this;
      var obj = {};
      var cellsAndValues;
      var curValue = this.inputCont.replace(/\s+/g, "");
      var tableHeader = this.tableHeader[this.tableHeader.length-1];//表头
      switch (this.dragDec) {
        case '横向':
            var trData = this.resultData[this.orderNum];//当前数据
            var tableHeaderColArr = Object.keys(tableHeader);
            var colArr = [];//拖拽的列
            var fullObj = {};
            for(var i = this.endTDMin;i<=this.endTDMax;i++){
                colArr.push(tableHeaderColArr[i])
            }
            this.dragCol = colArr;
            //console.log(_this.inputCont);
            for(var i =0;i<colArr.length;i++){
                obj[colArr[i]] = curValue;
                //如果是千分位
                if(tableHeader[colArr[i]].isThousands){
                    obj[colArr[i]] =  this.changeToNum(curValue,colArr[i]);

                }
                //如果是日期格式的
                if(tableHeader[colArr[i]].search&&tableHeader[colArr[i]].search.inputType=='date'){
                    obj[colArr[i]] = this.handelDate(curValue);
                }
                //如果是(是否进出口）
                if(tableHeader[colArr[i]].search&&tableHeader[colArr[i]].search.label=='是否进口'){
                    obj[colArr[i]] = this.entranceSelect[curValue.replace(/\s+/g, "")];
                }
            }
            fullObj[trData['id']] = obj;
            cellsAndValues = JSON.stringify(fullObj);
          break;
        case '纵向':
            var curColumn = {
              "column":this.startColArr[1],//获取当前列
            }
            this.insertIdx = 1;
            var dragIdArr = [];
            var jsonStr;
            console.log(curColumn);
            this.dragStartSort = this.resultData[Number(this.endTDMin)-1].sort;
            for(var i = Number(this.endTDMin)-1;i<this.endTDMax;i++){
                if(this.resultData[i].id){
                   dragIdArr.push(this.resultData[i].id);
                }else{
                  dragIdArr.push("insert"+ this.insertIdx)
                   this.insertIdx++;
                }
            }
            if(tableHeader[curColumn['column']].isThousands){
                curValue = this.changeToNum(curValue,curColumn['column']);
            }
            for(var i =0 ;i<dragIdArr.length;i++){
                obj[dragIdArr[i]] = {};
                obj[dragIdArr[i]][curColumn["column"]] = curValue;
                obj[dragIdArr[i]]['sort'] =   this.dragStartSort+i;
            }

            cellsAndValues = JSON.stringify(obj);
          break;
        default:
          break;
      }
      return cellsAndValues;
    },
    /*拖拽数据*/
    dragRenewDataFn(cellsAndValues){
      var _this = this;
      this.$parent.getUploadStatu(function(){
         _this.$http.post('/api/xlsUpdateData/updateDataList',{
            projectId: _this.sendParams.projectId,
            investorId: _this.sendParams.investorId,
            sheetName: _this.sheetName,
            groupId: _this.groupId,
            cellsAndValues:pako.changeToZip(cellsAndValues),
          }).then((data)=>{
              switch (_this.dragDec) {
                case '横向':
                    var idx = Number(_this.startColArr[0]);
                    data.data[0].check = _this.tableRows[idx].check||false;
                    data.data[0].numB =  _this.tableRows[idx].numB;
                    data.data[0].paste = true;
                    data.data[0] = _this.changeToThousand(data.data[0]);
                    _this.tableRows.splice(idx,1,data.data[0]);
                    _this.resultData.splice(data.data[0].numB-1,1,data.data[0]);
                    _this.pasteCloum = _this.dragCol;
                  break;
                case '纵向':
                    var startNumB = Number(_this.endTDMin);
                    var endNumB= _this.dragDecArr[0];
                    var idx = Math.min(Number(_this.startColArr[0]),_this.dragDecArr[0]);
                    _this.pasteCloum = _this.startColArr[1];
                    console.log(idx);
                    for(var i =0;i<data.data.length;i++){
                        data.data[i].check = false;
                        data.data[i].paste = true;
                        data.data[i] = _this.changeToThousand(data.data[i]);
                        data.data[i].numB = _this.endTDMin+i;
                        _this.tableRows.splice(idx+i,1,data.data[i]);
                        _this.resultData.splice( _this.endTDMin+i-1,1,data.data[i]);
                    }
                    _this.countEndNumB = _this.resultData[_this.endTDMin+i-2].numB;//最后新增的序号
                    _this.countEndSort = _this.resultData[_this.endTDMin+i-2].sort;//最后一条数据的sort值
                    // var startNum = data.data.length+idx;
                    // var curSort = _this.tableRows[startNum-1].sort;
                    // for(var i =startNum;i<_this.resultData.length;i++){
                    //     if(_this.resultData[i].id){
                    //       curSort++;
                    //       _this.$set(_this.resultData[i],'sort',curSort);
                    //     }
                    // }
                    //需要计算sort值
                   _this.$forceUpdate();
                   break;
                default:
                  break;
              }
              _this.resetDragData();
              //如果有新增的数据
              if(_this.insertIdx>1){
                  _this.totalNum = Number(_this.totalNum)+_this.insertIdx-1;
                  _this.pageMax = _this.pageMax+_this.insertIdx-1;
                  _this.$parent.updateSheetState(_this.sheetName,_this.totalNum);
                //需要修改sort值
                for(var i =_this.countEndNumB;i<_this.resultData.length;i++){
                  if(_this.resultData[i].id){
                    _this.countEndSort++;
                    _this.$set(_this.resultData[i],'sort', _this.countEndSort);
                  }
                }

              }
              _this.getTotalNum();
              _this.renewVisibleData(_this.divScrollTop);
              _this.$parent.sendConnect();


          }).catch((err)=>{
             _this.$messageError(err);

          })
      },'ack')
    },
    /*处理日期 */
    handelDate(curVal){
      var newVal;
      if(/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(curVal)){
          // if(curVal.indexOf('/')!=-1){
          //   var dateStr = curVal.split('/');
          //     if(Number(dateStr[1])<10){
          //       dateStr[1]='0'+dateStr[1];
          //     }
          //     if(Number(dateStr[2])<10){
          //       dateStr[1]='0'+dateStr[2];
          //     }
          //    newVal = dateStr[0]+''+ dateStr[1]+''+dateStr[2];
          // }
          // if(curVal.indexOf('-')!=-1){
          //   var dateStr = curVal.split('-');
          //     if(Number(dateStr[1])<10){
          //       dateStr[1]='0'+dateStr[1];
          //     }
          //     if(Number(dateStr[2])<10){
          //       dateStr[1]='0'+dateStr[2];
          //     }
          //     newVal = dateStr[0]+''+ dateStr[1]+''+dateStr[2];
          // }
          newVal = curVal;
      }else{
        newVal = '';
      }
      return newVal;
    },
    //（由于后台暂时没有处理）需要添加不可编辑的列
    addDisableColumnsFn(ruleType,disableColumns){
      if(ruleType==9&&this.sheetName=="车辆"){
        disableColumns+=";AE;AF;AG;AH;AI;AJ;AK;AL;AM;AN;AO;AP;AQ;AR;AS;AT;AU;AV";
      }
      if(ruleType==12&&this.sheetName=="无形-其他"){
        disableColumns = "C;D;E;F;G;H;I;J;K;L;M;N;O;XS;Q;R;S;T;U";
      }
      return disableColumns;
    },
    //收起作价规则
    retractPopverFn(){
      if(this.sheetName=='无形-土地'){
        if(this.selectListOne[this.casePricingIndex]) this.selectListOne[this.casePricingIndex] = false;
        if(this.selectListTwo[this.casePricingIndex]) this.selectListTwo[this.casePricingIndex] = false;
      }
    },

    // 批量展示与隐藏
    showOrHide () {
      this.$store.commit('changeShowCommon');
      this.$store.state.commonTitle = '显示/隐藏操作';
      this.$store.state.commonBtn = '确认';
      this.$store.state.componentsType = 'showOrHide'; //要调用组件的名称
      this.$store.state.isFullpage=true;
      this.$store.state.dataObj = { //需要传递的参数
        operateColumn: this.tableHeader[this.tableHeader.length-1],
        hiddenColumn: this.hiddenColumn
      }
    },

    //  处理冻结列时，下拉框中显示的表头值
    handleTableHead () {
      var _this = this;
      this.columnArr = []
      const keyArr = ['check', 'numB', 'operation', 'ruleType', 'B']
      this.currentColumn = ''
      for (let key in this.tableHeader[0]) {
        if (keyArr.indexOf(key) < 0) {
          let obj = {}
          obj['label'] = this.tableHeader[0][key]['label']
          obj['column'] = key
          this.columnArr.push(obj);
          this.fullHeadColum.push(obj);
        }
      }


    },

    // 处理隐藏时跨列的问题
    handleHeadColspan(data) {
      // 处理跨列的问题
      if (data.length > 1) {
        const hiddenColumns = this.hiddenColumn.split(',')
        let firstArr = []
        let secondArr = []
        for (let key in data[data.length-1]) {
          if (data[data.length - 1][key].hasOwnProperty('subHead')) {
            secondArr.push(data[data.length - 1][key])
            for (let headKey in data[0]) {
              if (data[0][headKey]['label'] === data[data.length - 1][key]['subHead']) {
                firstArr.push(data[0][headKey])
              }
            }
          }
        }
        firstArr = [...new Set(firstArr)]
        for (let firstKey in firstArr) {
          firstArr[firstKey].num = 0
          for (let secondKey in secondArr) {
            if(secondArr[secondKey]['subHead'] === firstArr[firstKey]['label']) {
              firstArr[firstKey].num += 1
            }
          }
          this.$set(firstArr[firstKey], 'colspan', firstArr[firstKey].num)
          console.log(firstArr[firstKey].num);
        }
        for (let key in data[data.length-1]) {
          if (hiddenColumns.indexOf(key) > -1) {
            if (data[data.length-1][key].hasOwnProperty('subHead')) {
              for (let columnKey in data[0]) {
                if (data[0][columnKey]['label'] === data[data.length-1][key]['subHead']) {
                  this.$set(data[0][columnKey], 'colspan', data[0][columnKey]['colspan']-1)
                  if (data[0][columnKey]['colspan'] == 0) this.hiddenColumn = this.hiddenColumn + ',' + columnKey
                }
              }
            }
          }
        }
      }
    },

    // 选择冻结的列后，需要直接触发接口
    freezeColumn () {
      // 65-90对应A-Z
      if (!this.currentColumn) return
      let curCode = this.currentColumn
      let str = ''
      if (this.currentColumn.length > 1) {
        let currentHead = this.columnArr.filter(item => item.column === this.currentColumn)
        let headTitle = currentHead[0].label
        for (let key in this.tableHeader[this.tableHeader.length-1]) {
          if (this.tableHeader[this.tableHeader.length-1][key].hasOwnProperty('subHead') && this.tableHeader[this.tableHeader.length-1][key]['subHead'] === headTitle) {
            curCode = key
          }
        }
      }
      const keyArr = ['check', 'numB', 'operation', 'ruleType', 'B']
      for (let colKey in this.tableHeader[this.tableHeader.length-1]) {
        if (keyArr.indexOf(colKey) < 0) {
          if (colKey !== curCode) {
            str = str + colKey + ','
          } else if(colKey === curCode){
            str = str + colKey
            break;
          }
        }
      }
      this.removeFreeze(str)
    },
    // 获取冻结的列
    /* setFixedColumn —— 设定冻结列
        @columnObj —— 传入表头对象（注意有两个）
        @data  —— 此处为形参， 实参为外面传入的冻结列字符串
    */
    getFreezeColumn (data) {
      let _this = this;
      if (this.tableHeader.length > 1) {
        setFixedColumn(this.tableHeader[0])
        let keyArr = data.split(',')
        keyArr.forEach(key => {
          if (key && _this.tableHeader[_this.tableHeader.length-1][key].hasOwnProperty('subHead')) {
            for (let column in this.tableHeader[0]) {
              if (this.tableHeader[0][column]['label'] === this.tableHeader[this.tableHeader.length-1][key]['subHead']) {
                this.$set(this.tableHeader[0][column], 'fixed', true)
              }
            }
          }
        })
      }
      setFixedColumn(this.tableHeader[this.tableHeader.length-1])
      function setFixedColumn(columnObj) {
        for (let key in columnObj) {
          if (data.split(',').indexOf(key)>-1 ) {
            _this.$set(columnObj[key], 'fixed', true)
          } else {
            const keyArr = ['check', 'numB', 'operation', 'ruleType', 'B']
            if (keyArr.indexOf(key)<0) {
              _this.$set(columnObj[key], 'fixed', false)
            }
          }
        }
      }
    },

    // 调用列冻结时的接口
    removeFreeze (param) {
      this.$http.post('api/xlsUpdateData/insertOrUpdateHiddenFreezeData', {
        type: 2, //1为隐藏，2为冻结
        column: param,
        projectId: this.$store.state.projectId,
        investorId: this.$store.state.investorId,
        xlsSheet: this.$store.state.curSheetName,
      }).then(res => {
        this.getFreezeColumn(param)
        this.frozeColumn = param
        this.currentColumn = ''
        this.isHideMenu = true;
      }).catch(err => {
        this.$messageError(err)
      })
    },

    // 改变页面列的显示与隐藏
    controlColumnShow(data) {
      this.hiddenColumn = data
      this.handleHeadColspan(this.tableHeader);
      this.$refs.tableHead.scrollLeft= 0;
      this.$refs.tableBody.style.left = 0;
      this.$refs.tableFoot.scrollLeft = 0;
    },

    // 设置全选值
    setCheckAll () {
      let flag = this.tableRows.every(item => item.check)
      return flag
    },

    // 全选后要勾选的条目
    checkedItems (flag) {
      this.allcheckStart = this.tableRows[0].numB
      this.allCheckEnd = this.allcheckStart + 99
      this.setResultDataCheck(flag)
    },
    // 设置resultData中条目的勾选
    setResultDataCheck (flag) {
      this.resultData.forEach(tableItem => {
        if (tableItem.numB < this.allcheckStart || tableItem.numB > this.allCheckEnd) {
          this.$set(tableItem, 'check', false)
        } else if (tableItem.numB <= this.allCheckEnd && tableItem.numB >= this.allcheckStart) {
          this.$set(tableItem, 'check', flag)
        }
      })
    },
    // 关闭弹窗
    closeTips () {
      this.$refs.tipsWrapper.closeDialog()
    },
    //跳转到某列
    jumpToColumn(){
      var _this = this,
          fWid = $('#fixed_cont').width(),
          oThs= $('#full_table_header').find('tr').eq(0).find('th'),
          keyArr = ['check', 'numB', 'operation', 'ruleType', 'B'],
          tableHeader = JSON.parse(JSON.stringify(this.tableHeader[0]));
      //判断是否是冻结列，如果是则回滚到初始
      if(tableHeader[this.jumpColumn].fixed){
          this.$refs.tableHead.scrollLeft= 0;
          this.$refs.tableBody.style.left = 0;
          this.$refs.tableFoot.scrollLeft = 0;
      }else{
         for(var i =0;i<oThs.length;i++){
         if(keyArr.indexOf($(oThs).eq(i).attr('data-column'))>-1) continue
          if(this.jumpColumn==$(oThs).eq(i).attr('data-column')){
              var left= ($(oThs).eq(i)[0].offsetLeft+1)-fWid;
              this.$refs.tableHead.scrollLeft= left;
              this.$refs.tableBody.style.left = left+"px";
              this.$refs.tableFoot.scrollLeft = left;
            break;
          }
        }
      }
      this.jumpColumn = ''
      this.isHideMenu = true;
    },
    //组装页面显示表头的列
    assembleColumn(){
        var obj1={
          'label':'',
          'options':[]
        };
        var obj2={
          'label':'',
          'options':[]
        };
        var tableHeader = JSON.parse(JSON.stringify(this.tableHeader[this.tableHeader.length-1]));
        var tableHeader0 = JSON.parse(JSON.stringify(this.tableHeader[0]));
        var hiddenColumns = this.hiddenColumn.split(',');
        var keyArr = ['check', 'numB', 'operation', 'ruleType', 'B'];
        var hidArr = [];
        var exhibitArr = [];
        this.joumpColumnArr=[];//重置
        var subHeadObj = {};
        for(var item in tableHeader){
            if(tableHeader[item].subHead){
               if(!subHeadObj[''+tableHeader[item].subHead]){
                  subHeadObj[''+tableHeader[item].subHead]= [];
               }
                subHeadObj[''+tableHeader[item].subHead].push(item);
             }
             if(hiddenColumns.indexOf(item)>-1&&tableHeader[item].subHead&&subHeadObj[tableHeader[item].subHead]){
                var idx = subHeadObj[tableHeader[item].subHead].indexOf(item);
                subHeadObj[tableHeader[item].subHead].splice(idx,1)
             }
          }
          for(var item in tableHeader0){
              //隐藏的列
            if(hiddenColumns.indexOf(item)>-1){
                 hidArr.push({
                    "label":tableHeader0[item].label,
                    "column":item,
                    "disabled":true
                  })
            }else{
              //显示的列
              if(keyArr.indexOf(item)<0){
                if(tableHeader0[item].colspan&&tableHeader0[item].colspan>1){
                    if(subHeadObj[tableHeader0[item].label]&&subHeadObj[tableHeader0[item].label].length>0){
                        exhibitArr.push({
                          "label":tableHeader0[item].label,
                          "column":item,
                          "disabled":false
                        })
                    }
                }else{
                  exhibitArr.push({
                    "label":tableHeader0[item].label,
                    "column":item,
                    "disabled":false
                  })
                }
              }
            }
          }
         obj1['options'] = exhibitArr;
         this.joumpColumnArr.push(obj1);
         if(this.hiddenColumn.length>0&&hidArr.length>0){
           obj2['options'] =hidArr;
           obj2['label']="已隐藏"
           this.joumpColumnArr.push(obj2);
         }
      console.log(this.joumpColumnArr);
    }
  },
  watch: {
    // tableRows: {
    //   handler: function(newD, oldD) {
    //     this.tableRows = newD;
    //   },
    //   deep: true
    // },
    // sheetNameBool(newD, oldD) {
    //   var _this = this;
    //   if(this.curSheetName!=this.sheetName||this.sheetName.indexOf('汇总')>-1) return;
    //   console.log('跟新了');
    //   //如果是股权投资的话是需要刷新的
    //   if(this.sheetName=="股权投资"){this.changeFlag = true}
    //   if (newD && this.changeFlag) {
    //     this.changeFlag = false;
    //     this.getSheetData();
    //     this.reckonHg();

    //   }else{
    //     //需要判断是否有人修改过科目，如果有修改的话则需要刷新页面，重置页面数据
    //      this.getSheetIfRefresh();
    //      this.reckonHg();
    //      //console.log('点击了哟');
    //   }
    // },
    // scrollTop(newD, oldD){
    //   var _this = this;
    //   this.scrollTop = this.$refs.tableScroll.scrollHeight-this.$refs.tableScroll.clientHeight;
    //   if(newD!=oldD){
    //     //this.renewVisibleData(_this.$refs.tableScroll.scrollTop);
    //     var scrollTop = _this.$refs.tableScroll.scrollTop;
    //     var wrapperHeight = this.$refs.tableScroll.clientHeight;
    //     var contentHeight = parseInt(this.contentHeight);
    //     if(contentHeight&&contentHeight>0&&(scrollTop+wrapperHeight)>=contentHeight){
    //       alert();
    //         this.renewVisibleData(contentHeight);
    //     }
    //   }
    // },
    nums:{
        handler: function(newD, oldD) {
            this.changeFlag = true;
        },
        deep: true
    },
    "$store.state.investorId"(newD,oldD){
        if(newD){
            this.sendParams.investorId=newD;
            this.pageNum = 1;
        }
    },

    /*"$store.state.clickCconfirmBtn"(){
      if(this.sheetName==this.curSheetName){
      	setTimeout(()=>{
      		this.reckonHg()
      	},100)
      }
    }*/

  },
  beforeDestroy () {
    document.addEventListener('click',function(){},false);
  }
};
</script>
<style rel="stylesheet/scss" lang='scss' scoped>
.isWarning{background: #f03131}
.t-ellipsis{display:block;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;}
.isFixedWid{width:1300px}
.arrow-up {
  width:5px;
  height: 5px;
  border: 6px solid transparent;
  // border-bottom: 6px solid #ebeef5;
  position: relative;
  left: 5px;
  top: -22px;
}
.arrow-up.last {
  left: 247px;
}
.arrow-up::after {
 position: absolute;
    content: "";
    top: 18px;
    left: -10px;
    border: 5px solid transparent;
    border-bottom: 5px solid #fff;
    width: 5px;
    width: 8px;
    height: 8px;
    background: white;
    border-bottom: 2px solid transparent;
    border-right: 2px solid transparent;
    -webkit-transform: rotatez(45deg);
    transform: rotatez(45deg);
    -webkit-clip-path: polygon(0px 0px, 0px 25px, 25px 0px);
    clip-path: polygon(0px 0px, 0px 20px, 20px 0px);
}
.arrowLeft {
  width: 0;
  border: 5px solid transparent;
  border-right: 5px solid #ebeef5;
  position: absolute;
  left: -11px;
  top: 3px;
}

.arrowLeft::after {
  position: absolute;
  content: "";
  top: -5px;
  left: -2px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-right: 5px solid #fff;
}
.arrowRight {
  width: 0;
  border: 5px solid transparent;
  border-left: 5px solid #ebeef5;
  position: absolute;
  right: -11px;
  top: 3px;
}

.arrowRight::after {
  position: absolute;
  content: "";
  top: -5px;
  right: -2px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-left: 5px solid #fff;
}
.c-black {
  color: #333 !important;
  padding:0 5px;
}
.table80-wrap {position: relative;height: 100%;padding: 0 12px;
  .search-bar{padding-left: 12px;}
  .searchCondition {
    margin-right: 90px;
    > li {
      display: inline-block;
      margin-bottom: 10px;
      margin-right: 5px;
      height: 25px;
      line-height: 25px;
      background: #f1f8e8;
      border-radius: 2px;
      border: 1px solid #c8deaf;
      padding: 0 10px;
      > span {
        color: #98c268;
        font-size: 13px;
      }
      > i {
        margin-left: 20px;
        font-size: 13px;
        color: #98c268;
      }
    }
  }
  .search-btn{
    position: absolute;
    top: 0;
    right: 17px;
    width:100px;
  }
  .left {
    /deep/ .el-input {
      .el-input__inner {
        text-align: left;
      }
    }
  }
  .center {
    /deep/ .el-input {
      .el-input__inner {
        text-align: center;
      }
    }
  }
  .right {
    /deep/ .el-input {
      .el-input__inner {
        text-align: right;
      }
    }
  }
  .wrap-table-head {
  	// position: relative;
    overflow: hidden;
  	/*width: 100%;
    position: absolute;
    top: 0;*/
    th {
      position: relative;
      .headRight {
        position: absolute;
        right: -2px;
        top: -26px;
        height: 200%;
        width: 3px;
        z-index: 10;
        cursor: col-resize;
      }
    }

    .tableHeadFilter {
      display: inline-block;
      position: absolute;
      height: 18px;
      top: 6px;
      right: 6px;
      margin-left: 8px;
      > i {
        display: block;
        cursor: pointer;
      }
      .triangle-up {
        margin-bottom: 3px;
        width: 0;
        height: 0;
        border-bottom: 6px solid #3a80ec;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        opacity: 0.6;
      }
      .triangle-down {
        margin-top: 2px;
        width: 0;
        height: 0;
        border-top: 6px solid #3a80ec;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        opacity: 0.6;
      }
      .triangle-up:hover,
      .triangle-down:hover {
        opacity: 1;
      }
    }
  }
  .wrap-table-body {
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    /*position: absolute;
    top: 28px;
    bottom: 38px;
    width: 100%;*/
    .noData {
      width: 100%;
      z-index: 3;
      position: relative;
    }
    .noDataCols10{
      height: 140px;
      line-height: 230px;
    }
    table {
      position: relative;
      .operation-icon {
        cursor: pointer;
      }
    }
    .el-table__noData {
      min-height: 60px;
      text-align: center;
      width: 100%;
      height: 100%;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      .el-table__noData-text {
        width: 50%;
        color: #909399;
        font-size: 13px;
      }
    }
  }
  .wrap-table {
    position:relative;
    height: 100%;
    border: 1px solid #e5e5e5;
    overflow: hidden;
    border-collapse: collapse;
    tr {
      height: 21px;
      td,
      th {
        border: 1px solid #e5e5e5;
      }
    }
    thead {
      tr {
        background: #f6faff;
        height: 28px;
        th {
           /deep/ .el-checkbox  .el-checkbox__label{font-size:14px!important;}
          .cell {
            position: relative;
            font-size: 14px;
            &.cellHd{min-width: 80px;
              .searchMSpan{width: 80%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;display: inline-block;}
            }
          }
          .searchM {
            padding: 3px 22px;
            box-sizing: border-box;
            > span {
              width: 100%;
              display: block;
              // line-height: 19px;
            }
            .searchMSpan {
              position: relative;
              display: block;
              border-radius: 2px;
              border: 1px solid #3a80ec;
              color: #3a80ec;
              cursor: pointer;
              // min-width: 40px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            }
          }
        }
      }
      tr:first-child th {
        border-top: none;
        vertical-align: middle;
      }
      tr th:first-child {
        border-left: none;
      }
      tr th:last-child {
        //border-right: none;
      }
    }
    tbody {
      tr {
        td {
          height:100%;position: relative;
          .drag-peg{position: absolute;right: 0;bottom: 0;width: 6px;height: 6px;background: #4b89ff}
          .cell {
            font-size: 14px;
            .pr5{
              padding: 0 5px;
            }
            &.checkedBlueCell{
              /deep/ .el-input.is-disabled .el-input__inner{ background:#3A80EC!important;color:#fff !important;}
            }
            .operation {
              text-align: center;
              > i {
                padding: 0 5px;
              }
            }

            /deep/ .el-input {
              .el-input__inner {
                border-radius: 0;
                border-color: rgba(255, 255, 255, 0);
                height: 20px !important;
                padding: 0 5px !important;
                background: none;
                font-size:14px !important;
              }

              &.isMarked{
                  .el-input__inner{background:yellow !important;}
                   &.el-input--suffix{
                     .el-input__inner{background:yellow !important;}
                  }
                }
               &.isPasted{
                 .el-input__inner{background: #e0ffe9!important;}
                 &.el-input--suffix{
                     .el-input__inner{background: #e0ffe9!important;}
                  }
               }
               &.isMoved{
                 .el-input__inner{border:2px dashed #d2d7dc;background:#fff}
               }
               &.isDrag{
                 .el-input__inner{border:1px solid #88C6FF;background:#fff}
               }
               &.is-disabled{
                   .el-input__inner{background: #f8f8f8 !important; color: #9d9b9b;}
                  &.el-input--suffix{
                    // .el-input__inner{background: none !important;}
                  }
              }
            }
            /deep/ .el-select{
               &.isMarked .el-input .el-input__inner{background:yellow !important;}
            }
             /deep/ .el-select{
               &.isPasted .el-input .el-input__inner{background: #e0ffe9!important;}
            }
          }
        }
      }
      tr:first-child td {
        border-top: none;
      }
      tr td:first-child {
        border-left: none;
      }
      tr td:last-child {
        //border-right: none;
        .cell{
           /deep/ .el-input {
              .el-input__inner {
                 padding-right:17px !important;
              }
          }
        }
      }
      tr.is-selected td {
        background: #fff5eb;
      }
    }
    .tableTotal {
     	/*width: 100%;
    	position: absolute;
    	bottom: 0;*/
      position:relative;
      margin-top: 0;
      border-top: 1px solid #e5e5e5;
      overflow-x: auto;
      background: #fff;
     // min-height: 20px;
      table {
        position: relative;
        tr > td {
          line-height: 20px;
        }
      }
      &.table-scroll-x{overflow-x: scroll;}
      &.balanceTableFd{min-height: 20px;overflow-x: auto;}
      &.noTopBorder{border-top:none;overflow-x: auto;}

    }

  }
  .contextmenu {
    position: fixed;
    z-index: 1000;
    width: 200px;
    background: #fff;
    border: 1px solid #e5e5e5;
    box-shadow: 0px 2px 7px 0px rgba(203, 202, 202, 0.5);
    border-radius: 3px;
    ul {padding: 10px 0;
      li {
        line-height: 25px;
        padding-left: 20px;
        font-size: 13px;
        .cellNums{
          display: inline-block;
          padding: 0 3px;
          /deep/ .el-input-number--small{
              width: 50px;
          }
          /deep/ .el-input-number.is-controls-right .el-input-number__decrease,/deep/ .el-input-number.is-controls-right .el-input-number__increase{
            width: 16px;
            border:none;
            background: none;
            .el-icon-arrow-up:before{
              content: "\e78f"
            }
            .el-icon-arrow-down:before{
              content:"\e790"
            }
          }
        }
      }
      li:hover {
        background: #EBEEF2;
      }
    }
  }
  .operation {
    width: 110px;
    li{ cursor: pointer;}
    &.maxWidth{width:170px;}
    i {
      padding-right: 10px;
      display: inline-block;
      font-size: 14px;
      width: 18px;
      text-align: center;
      color: #939393;
    }
  }
  .sort-cont, .sign-cont{width:98px;
    ul{position:relative}
    li{cursor:pointer;font-size:12px !important;border-radius: 2px !important;
      &.active,&:hover{background:#3a80ec !important;color:#fff}
    }
  }

  .table-head-tooltip {
    width: 260px;
    height: auto;
    background: #fff;
    box-shadow: 0px 2px 7px 0px rgba(203, 202, 202, 0.5);
    border-radius: 3px;
    padding: 0 12px 12px;
    border: 1px solid #ebeef5;
    position: absolute;
    z-index: 5;
  }
  .collapse {
    visibility: collapse;
  }
  .dialog-content{
    text-align: center;
  }
  .tip-content{
    margin: 0 auto;
    width: 190px; height: 50px;
    line-height: 25px;
    text-align: center;
    font-size:13px; color:rgba(38,38,40,1);
  }
  .dialog-footer {
    text-align: center;
    .search-btn{position: static;}
  }
}
.tableBody /deep/.el-date-editor.el-input,.tableBody /deep/.el-date-editor.el-input__inner{width: 100%;}
.fixed-wid-table /deep/.el-date-editor.el-input,.fixed-wid-table /deep/.el-date-editor.el-input__inner{width: 100%;}

.tableBody /deep/ .el-input__icon, .fixed-wid-table /deep/ .el-input__icon{height: 20px !important; line-height: 20px !important; color: #C0C0C0;  }

.wrap-table-head thead tr th div{text-align:center;}
/*资产负债表*/
.isBalanceTable{
  @for $i from 2 through 12 {
     tr:nth-child(#{$i}) td:nth-child(1){text-indent: 10px}
     tr:nth-child(#{$i}) td:nth-child(6){text-indent: 10px}
  }
  @for $i from 15 through 31{
     tr:nth-child(#{$i}) td:nth-child(1){text-indent: 10px}
  }
   @for $i from 16 through 22{
     tr:nth-child(#{$i}) td:nth-child(6){text-indent: 10px}
  }
   @for $i from 26 through 30{
     tr:nth-child(#{$i}) td:nth-child(6){text-indent: 10px}
  }
  tr:nth-child(13) td:nth-child(1), tr:nth-child(14) td:nth-child(6),tr:nth-child(32) td:nth-child(1),
  tr:nth-child(33) td:nth-child(1), tr:nth-child(24) td:nth-child(6)
  {text-indent: 28px;font-weight:bold }
  tr:nth-child(33),tr:nth-child(31) td:nth-child(6){font-weight:bold}
  tr:nth-child(23) td:nth-child(6){text-indent: 24px;font-weight:bold}
}
/*审定数*/
.isAuditedTable{
   tr:nth-child(1) td:nth-child(2),tr:nth-child(13) td:nth-child(2),
   tr:nth-child(31) td:nth-child(2),tr:nth-child(32) td:nth-child(2),
   tr:nth-child(45) td:nth-child(2),tr:nth-child(53) td:nth-child(2),
   tr:nth-child(54) td:nth-child(2){font-weight:bold}
  @for $i from 2 through 12{
     tr:nth-child(#{$i}) td:nth-child(2){text-indent: 10px}
  }
  @for $i from 14 through 30{
     tr:nth-child(#{$i}) td:nth-child(2){text-indent: 10px}
  }
  @for $i from 33 through 44{
     tr:nth-child(#{$i}) td:nth-child(2){text-indent: 10px}
  }
   @for $i from 46 through 52{
     tr:nth-child(#{$i}) td:nth-child(2){text-indent: 10px}
  }
}
.operationHover{
  &:hover{
    opacity: 0.7;
  }
}
.el-icon-close{
  cursor:pointer;
}
.isdisabled {
  pointer-events:none;
  opacity:0.5;
  cursor: default;
}
//.isProfitTable{}

//固定列
.wrap-table-fixed{position:absolute;left:0;top:0;background: #fff;z-index:3;
  .cell .el-input .el-input__inner{height: 20px !important;padding: 0 5px !important;}
  .wrap-scroll{ overflow: hidden; width: 100%;}
  .wrap-table-body{&::-webkit-scrollbar{  display: none; }
    overflow:-moz-scrollbars-none;
    width: calc(100% + 20px);
  }
  .fixed-wid-table tbody{
    tr td:last-child {
        //border-right: none;
        .cell{
           /deep/ .el-input {
              .el-input__inner {
                 padding-right:5px !important;
              }
          }
        }
      }
  }
  .wrap-table-head{box-shadow: 0 -1px 8px rgba(0,0,0,.08);z-index:4;}

}
.table-footer{position:relative;
  .fixed-table-taotal{position:absolute !important;left:0;top:0;box-shadow: 0 -1px 8px rgba(0,0,0,.08);z-index:1;background:#fff;
    table{width:100px;}
  }
}
/deep/ .el-select{width:100%;}
.fixed-wid-table{  //width:100px;
  tbody{position:absolute;left:0;right:0;top:0;transform: translate3d(0,0,0);
    .cell{
      >div>span{ display:block;}
    }
  }
}
// 案例作价
.land-select-list{
  li{ padding:0 8px;
    &.actived,&:hover{color:#409EFF;}
  }
}
.select-case-pricing{ display:inline-block; color:#606266; width:188px; border-radius:0; padding:0 !important;
  &[disabled]{ color:#C0C4CC; background-color:#ededed;height: 19px;}
  /deep/ span{ padding-right:25px; display:inline-block; width:100%; box-sizing:border-box;text-overflow:ellipsis; overflow: hidden; white-space: nowrap;
    i.el-icon-arrow-down.el-icon--right{ position:absolute; right:10px; top:5px; color:#C0C4CC;}
  }
}
.case-pricing-btn{ height:34px; width:100%; padding:0 8px !important; border-radius:0; color:#262628;
  &.actived,&:hover{ background-color:#409EFF; color:#fff;}
}
.case-pricing-list{
  /deep/ .el-checkbox{ width:100%; margin:0; padding:5px 0; border-bottom:1px solid #ECECEC;}
}
//去除disabled样式
.checkedBG{
  /deep/ .el-input.is-disabled .el-input__inner{
    cursor: pointer;
    color:#262628;
  }
}

.clusterize-scroll .clusterize-content tbody{position: absolute;left: 0;right: 0;top:0;transform: translate3d(0,0,0);}
.wrap-table-fixed.transparent{background: transparent !important}
.iconGroup{display: inline-block;text-align: left;width: 40px;
  .case-icon{vertical-align: middle;cursor: pointer;display: inline-block;width: 14px;height: 14px;line-height: 14px;font-size:12px;border-radius:3px;border: 1px solid #c3c3c3;text-align: center;color: #c3c3c3;
    &.actived{color:#11BF6B;border-color: #11BF6B;}
  }
}
.table80-wrap .wrap-table tbody tr td .cell /deep/.el-date-editor.el-input .el-input__inner{padding-left:26px !important }
.table80-wrap .wrap-table tbody tr td .cell /deep/.el-select .el-input .el-input__inner{padding-right:26px !important }
</style>