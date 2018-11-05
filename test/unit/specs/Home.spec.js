import HomeComponent from '@/components/Home'

describe('Home.vue', () => {
  it('should have components', () => {
    expect(HomeComponent.components).to.be.an('object')
  })
})
