const routes = [
  {
    path: '/design',
    name: 'DesignSystemMain',
    component: () => import('@/dev/designSystem/Index.vue'),
    children: [
      {
        path: '/design',
        name: 'Design System',
        component: () => import('@/dev/designSystem/page/DesignSystem.vue')
      },
      {
        path: '/foundation',
        name : 'Foundation',
        component :  () => import('@/dev/designSystem/page/foundation/Foundation.vue'),
        children:[          
          {
            path: 'color',
            name : 'Color',
            component :() => import('@/dev/designSystem/page/foundation/Color.vue'),
          },{
            path: 'typography',
            name : 'Typography',
            component : () => import('@/dev/designSystem/page/foundation/Typography.vue'),
          },{
            path: 'icon',
            name : 'Icon',
            component : () => import('@/dev/designSystem/page/foundation/Icon.vue'),
          }
        ]
      },
      {
        path: '/form',
        name : 'Forms',
        component : () => import('@/dev/designSystem/page/form/Forms.vue'),
        children:[        
          {
            path: 'checks',
            name : 'Check & Radio & Switch',
            component : () => import('@/dev/designSystem/page/form/Checks.vue'),
          },{
            path: 'selectbox',
            name : 'Selectbox',
            component : () => import('@/dev/designSystem/page/form/Selectbox.vue'),
          // },{
          //   path: 'input',
          //   name : 'Input',
          //   component : () => import('@/dev/designSystem/page/form/Input.vue'),
          }
        ]
      },
      {
        path: '/components',
        name: 'Components',
        component: () => import('@/dev/designSystem/page/components/Components.vue'),
        children: [
          {
            path: 'button', 
            name: 'Button',
            component: () => import('@/dev/designSystem/page/components/Button.vue'),
          },{
            path: 'modal', 
            name: 'Modal',
            component:  () => import('@/dev/designSystem/page/components/Modal.vue'),
          },{
            path: 'tab', 
            name: 'Tab',
            component:() => import('@/dev/designSystem/page/components/Tab.vue'),
          },{
            path: 'notification', 
            name: 'Notification',
            component: () => import('@/dev/designSystem/page/components/Notification.vue'),
          },{
            path: 'tooltip', 
            name: 'Tooltip',
            component: () => import('@/dev/designSystem/page/components/Tooltip.vue'),
          },{
            path: 'kebab', 
            name: 'Kebab',
            component: () => import('@/dev/designSystem/page/components/Kebab.vue'),
          }
        ]
      },  
      {
        path: '/paragraph',
        name: 'Paragraph',
        component: () => import('@/dev/designSystem/page/paragraph/Paragraph.vue'),
        children: [
          {
            path: 'table', 
            name: 'Table',
            component: () => import('@/dev/designSystem/page/paragraph/Table.vue'),
          },{
          //   path: 'list', 
          //   name: 'List',
          //   component: () => import('@/dev/designSystem/page/paragraph/List.vue'),
          // },{
          //   path: 'nodata', 
          //   name: 'Nodata',
          //   component:  () => import('@/dev/designSystem/page/paragraph/Nodata.vue'),
          // },{
            path: 'avatar', 
            name: 'Avatar',
            component:() => import('@/dev/designSystem/page/paragraph/Avatar.vue'),
          }
        ]
      },   
    ]
  }
]

export default ['development'].includes(process.env.NODE_ENV) ? routes : []