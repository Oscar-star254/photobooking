function SocialShare() {
  const url = window.location.href;

  return (
    <div>
      <a
        href={`https://wa.me/?text=${url}`}
        target="_blank"
      >
        WhatsApp
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
      >
        Facebook
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${url}`}
        target="_blank"
      >
        X
      </a>
    </div>
  );
}

export default SocialShare;
