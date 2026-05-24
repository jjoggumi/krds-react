<template>
  <article class="tooltipSys type01">
    <div class="sections">
      <section>
        <h2>Avatar Type Default</h2>
        <div class="hi-row">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="class" 
              size="lg" 
              alt="프로필 이미지" 
            />              
            <p class="mt-20">학교 기본이미지</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="profile" 
              size="lg" 
              alt="프로필 이미지" 
            />  
            <p class="mt-20">프로필 기본이미지</p>
          </div>           
        </div>
      </section>       
      <section>
        <h2>Avatar Size</h2>
        <div class="hi-row">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="school" 
              size="xs" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            />              
            <p class="mt-20">xs</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="school" 
              size="sm" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            />  
            <p class="mt-20">sm</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="school" 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            />  
            <p class="mt-20">md</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="school" 
              size="lg" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            />  
            <p class="mt-20">lg</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="school" 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            />  
            <p class="mt-20">xl</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              type="school" 
              size="xxl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
              badge="edit" 
              position="button-right" 
            />  
            <p class="mt-20">xxl</p>
          </div>                   
        </div>
      </section>    
      <section>
        <h2>Avatar Badge Style</h2>        
        <div class="hi-row mt-20">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="primary" outline rounded="rounded" class="top-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">md, top-left</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="noti" outline rounded="rounded" class="top-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">md, top-right</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="info" outline rounded="rounded" class="bottom-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">md, bottom-left</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="gray" outline rounded="rounded" class="bottom-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">md, bottom-right</p>
          </div>                    
        </div>
        <div class="hi-row mt-20">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="lg" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="primary" outline rounded="rounded" class="top-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">lg, top-left</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="lg" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="noti" outline rounded="rounded" class="top-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">lg, top-right</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="lg" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="info" outline rounded="rounded" class="bottom-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">md, bottom-left</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="lg" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="gray" outline rounded="rounded" class="bottom-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">lg, bottom-right</p>
          </div>                    
        </div>
        <div class="hi-row mt-20">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="primary" outline rounded="rounded" class="top-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">xl, top-left</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="noti" outline rounded="rounded" class="top-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">xl, top-right</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="info" outline rounded="rounded" class="bottom-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">xl, bottom-left</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="gray" outline rounded="rounded" class="bottom-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">xl, bottom-right</p>
          </div>                    
        </div>
      </section>        
      <section>
        <h2>Avatar Use Badge</h2>
        <div class="hi-row mt-40 mb-40">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >  
              <template v-slot:badge>
                <HiIcon name="ico-crown-fill" color="white" bgColor="noti" outline rounded="rounded" class="top-left"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">admin badge</p>
          </div>                         
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="md" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >  
              <template v-slot:badge>
                <i class="badge new"></i>
              </template>
            </HiAvatar>
            <p class="mt-20">new badge</p>
          </div>
                          
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>                
                <i class="badge main-admin"></i>
              </template>
            </HiAvatar>
            <p class="mt-20">main admin badge</p>
          </div>  
        </div>
        <div class="hi-row mt-20">
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="lg" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="primary" outline rounded="rounded" class="bottom-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">edite badge</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-pen2" color="white" bgColor="primary" outline rounded="rounded" class="bottom-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">edite badge</p>
          </div>                   
          <div class="col-sm-3 txt-center">
            <HiAvatar 
              size="xl" 
              img="https://image.hiclass.net/static/images/class_image_default_05.png" 
              alt="프로필 이미지" 
            >              
              <template v-slot:badge>
                <HiIcon name="ico-photo" color="white" bgColor="gray" outline rounded="rounded" class="bottom-right"></HiIcon>
              </template>
            </HiAvatar>
            <p class="mt-20">edite badge</p>
          </div>                    
        </div>
      </section>         
      </div> 
  </article>
</template>

<script>
export default {
  name: "Avatar",
  data() {
    return {}
  },
  methods: {
  },
};
</script>
<style lang="scss" scoped>
.designSys .avatarSys{}
</style>
