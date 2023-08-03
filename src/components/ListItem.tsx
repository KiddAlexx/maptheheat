function ListItem({ restaurant }) {
  const { name, address, hours, description } = restaurant;
  return (
    <div>
      <h2>{name}</h2>
      <h3>{address}</h3>
      <p>{hours}</p>
      <p>{description}</p>
    </div>
  );
}

export default ListItem;
