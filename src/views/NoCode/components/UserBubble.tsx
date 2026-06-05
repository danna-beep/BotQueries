const UserBubble = ({ text }: { text: string }) => (
  <div className='flex justify-end'>
    <div className='max-w-[85%] rounded-2xl rounded-tr-md border border-primary/20 bg-primary/10 px-4 py-2.5 text-[14px] leading-relaxed text-foreground'>
      {text}
    </div>
  </div>
)

export default UserBubble
