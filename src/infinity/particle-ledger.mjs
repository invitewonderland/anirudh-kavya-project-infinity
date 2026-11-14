// Tracks only potentially visible ring-buffer spans. Expiration is conservative: no live vertex is skipped.
export class ParticleLedger{
  constructor(capacity){this.capacity=capacity;this.blocks=[];this.head=0;this.count=0;this.nextExpiry=Infinity;}
  add(start,count,expires){
    this.blocks.push({start,count,expires});this.count+=count;
    while(this.count>this.capacity){const block=this.blocks[this.head],cut=Math.min(block.count,this.count-this.capacity);block.start=(block.start+cut)%this.capacity;block.count-=cut;this.count-=cut;if(!block.count)this.head++;}
    this.nextExpiry=this.blocks[this.head]?.expires??Infinity;
  }
  expire(now){
    if(now<this.nextExpiry)return;
    while(this.head<this.blocks.length&&this.blocks[this.head].expires<=now){this.count-=this.blocks[this.head++].count;}
    if(this.head>128){this.blocks.splice(0,this.head);this.head=0;}
    this.nextExpiry=this.blocks[this.head]?.expires??Infinity;
  }
  get start(){return this.blocks[this.head]?.start??0;}
  clear(){this.blocks.length=0;this.head=0;this.count=0;this.nextExpiry=Infinity;}
}
