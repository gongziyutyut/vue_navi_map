export default {
  '66': [
    {
    // 其他非流动资产
      'operation': { label: '操作', minWidth: 60, fixed: true },
      'check': { label: '', minWidth: 80, fixed: true },
      'numB': { label: '序号', minWidth: 60, fixed: true, 'footLabel': ['合计'], width: 60 },
      'ruleType': {
        'label': '作价规则',
        'minWidth': 188,
        'align': 'center',
        'search': {
          'isShow': false,
          'type': 'tab',
          'label': '作价规则',
          'placeholder': '',
          'tab1': 'checkbox',
          'check': [],
          'tabTitle': '系数调整',
          'rule': [{ value: 2, label: '账面比例作价' }, { value: 6, label: '特殊作价' }]
        },
        'isFilter': true,
        'selected': true,
        fixed: true
      },
      'B': {
        'label': '内容或名称',
        'align': 'left',
        'minWidth': 188,
        'search': {
          'isShow': false, 'type': 'selectInput', 'label': '内容或名称', 'placeholder': '请输入内容或名称', title: '包含'
        },
        'isFilter': true,
        fixed: true
      },
      'C': {
        'label': '取得日期',
        'minWidth': 120,
        'align': 'center',
        'search': {
          'isShow': false, 'type': 'range', 'label': '取得日期', 'placeholder': '', title1: '包含', title2: '包含', inputType: 'date'
        },
        'isFilter': true
      },
      'D': {
        'label': '审计前账面值',
        'minWidth': 150,
        'align': 'right',
        'search': {
          'isShow': false, 'type': 'range', 'label': '审计前账面值', 'placeholder': '', title1: '包含', title2: '包含'
        },
        'isFilter': true,
        'isThousands': true
      },
      'E': {
        'label': '审计调整',
        'align': 'right',
        'minWidth': 120,
        'search': {
          'isShow': false, 'type': 'range', 'label': '审计调整', 'placeholder': '', title1: '包含', title2: '包含'
        },
        'isFilter': true,
        'isThousands': true
      },
      'F': {
        'label': '账面价值',
        'minWidth': 120,
        'align': 'right',
        'search': {
          'isShow': false, 'type': 'range', 'label': '账面价值', 'placeholder': '', title1: '包含', title2: '包含'
        },
        'isFilter': true,
        'isThousands': true
      },
      'G': {
        'label': '评估价值',
        'minWidth': 120,
        'align': 'right',
        'search': {
          'isShow': false, 'type': 'range', 'label': '评估价值', 'placeholder': '', title1: '包含', title2: '包含'
        },
        'isFilter': true,
        'isThousands': true
      },
      'H': {
        'label': '增值率%',
        'minWidth': 120,
        'align': 'right',
        'search': {
          'isShow': false, 'type': 'range', 'label': '增值率%', 'placeholder': '', title1: '包含', title2: '包含'
        },
        'isFilter': true
      },
      'I': {
        'label': '备注',
        'minWidth': 120,
        'align': 'left',
        'search': {
          'isShow': false, 'type': 'selectInput', 'label': '备注', placeholder: '请输入备注', title: '包含'
        },
        'isFilter': true
      },
      'XS': {
        'label': '账面值系数',
        'minWidth': 120,
        'align': 'right',
        'search': {
          'isShow': false, 'type': 'tab', 'label': '账面值系数', 'placeholder': '', 'tabTitle': '系数调整', 'tab1': 'range', title1: '包含', title2: '包含'
        },
        'isFilter': true
      },
      'K': {
        'label': '草稿栏1',
        'minWidth': 120,
        'align': 'left',
        'search': {
          'isShow': false, 'type': 'selectInput', 'label': '草稿栏1', 'placeholder': '', title: '包含'
        },
        'isFilter': true
      },
      'L': {
        'label': '草稿栏2',
        'minWidth': 120,
        'align': 'left',
        'search': {
          'isShow': false, 'type': 'selectInput', 'label': '草稿栏2', 'placeholder': '', title: '包含'
        },
        'isFilter': true
      },
      'M': {
        'label': '草稿栏3',
        'minWidth': 120,
        'align': 'left',
        'search': {
          'isShow': false, 'type': 'selectInput', 'label': '草稿栏3', 'placeholder': '', title: '包含'
        },
        'isFilter': true
      },
      'N': {
        'label': '草稿栏4',
        'minWidth': 120,
        'align': 'left',
        'search': {
          'isShow': false, 'type': 'selectInput', 'label': '草稿栏4', 'placeholder': '', title: '包含'
        },
        'isFilter': true
      },
      'O': {
        'label': '草稿栏5',
        'minWidth': 200,
        'align': 'left',
        'search': {
          'last': 'true', 'isShow': false, 'type': 'selectInput', 'label': '草稿栏5', 'placeholder': '', title: '包含'
        },
        'isFilter': true
      }

    }]
}
