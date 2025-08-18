import VenueListContainer from '../venues/components/VenueListContainer';

function SideBar() {
  return (
    <div className="flex w-[40rem] shrink-0 flex-col p-3">
      <VenueListContainer mode="venue" />
    </div>
  );
}

export default SideBar;
