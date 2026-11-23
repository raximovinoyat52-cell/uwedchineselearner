// One persistent media element keeps playback tied to the user's tap on iPhone.
export function createPronunciationPlayer({audio,panel,wordLabel,status,close,translate}) {
  let request=0, active=false;
  const say=(text,state)=>{status.textContent=text;status.dataset.state=state;};
  const mediaError=()=>{
    if(!active||audio.error?.code===1)return;
    say(translate('Запись не загрузилась. Подключись к интернету и нажми ▶ ещё раз.', 'Yozuv yuklanmadi. Internetga ulanib, ▶ tugmasini yana bos.'),'error');
  };
  audio.addEventListener('playing',()=>{if(active)say(translate('Воспроизведение', 'Yozuv ijro etilyapti'),'playing');});
  audio.addEventListener('waiting',()=>{if(active)say(translate('Загружается запись…', 'Yozuv yuklanyapti…'),'loading');});
  audio.addEventListener('ended',()=>{if(active)say(translate('Запись завершена · ▶ — повторить', 'Yozuv tugadi · qayta tinglash uchun ▶ tugmasini bos'),'ended');});
  audio.addEventListener('pause',()=>{if(active&&audio.paused&&!audio.ended&&audio.currentTime>0)say(translate('Пауза · ▶ — продолжить', 'To‘xtatib turildi · davom ettirish uchun ▶ tugmasini bos'),'paused');});
  audio.addEventListener('error',mediaError);
  function stop(){request++;active=false;audio.pause();panel.hidden=true;}
  function play(word){
    const ownRequest=++request;active=false;audio.pause();active=true;
    panel.hidden=false;wordLabel.textContent=`${word.hanzi} · ${word.pinyin}`;
    say(translate('Загружается запись…', 'Yozuv yuklanyapti…'),'loading');
    const src=`/audio/${word.id}.mp3`;
    if(audio.getAttribute('src')!==src)audio.setAttribute('src',src);
    else if(audio.error)audio.load();
    audio.muted=false;audio.volume=1;try{audio.currentTime=0;}catch{}
    // Do not await a fetch or voice-loading callback before this play() call.
    // Safari requires it in the original user-gesture handler.
    try {
      const result=audio.play();
      if(result&&typeof result.catch==='function')result.catch(error=>{
        if(ownRequest!==request||!active||error.name==='AbortError')return;
        if(error.name==='NotAllowedError')say(translate('Нажми ▶ в плеере, чтобы включить звук.', 'Ovozni eshitish uchun audio oynasidagi ▶ tugmasini bos.'),'blocked');
        else mediaError();
      });
    } catch(error) {
      if(error.name==='NotAllowedError')say(translate('Нажми ▶ в плеере, чтобы включить звук.', 'Ovozni eshitish uchun audio oynasidagi ▶ tugmasini bos.'),'blocked');
      else mediaError();
    }
  }
  close.onclick=stop;
  return {play,stop};
}
