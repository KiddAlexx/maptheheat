import styles from './ListItem.module.css';

function ListItem({ restaurant, handleClick }) {
  const { name, address, hours, description } = restaurant;
  return (
    <div className={styles.listItemContainer} onClick={handleClick}>
      <div className={styles.tempImageContainer}></div>
      <div>
        <h2>{name}</h2>
        <h3>{address}</h3>
        <p>{hours}</p>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default ListItem;
